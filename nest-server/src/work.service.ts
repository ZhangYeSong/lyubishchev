import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Work } from './work';

@Injectable()
export class WorkService {
  constructor(
    @Inject('WORK_MODEL')
    private workModel: Model<Work>,
  ) {}

  async create(work: Work): Promise<Work> {
    const createdCat = new this.workModel(work);
    return createdCat.save();
  }

  async findAll(): Promise<Work[]> {
    return this.workModel.find().exec();
  }
}