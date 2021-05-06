import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Work } from './work';
import { CreateWorkDto } from './create-work.dto';

@Injectable()
export class WorkService {
  constructor(
    @Inject('WORK_MODEL')
    private workModel: Model<Work>,
  ) {}

  async create(workDto: CreateWorkDto) {
    const createdCat = new this.workModel(workDto);
    return createdCat.save();
  }

  async findAll(): Promise<Work[]> {
    return this.workModel.find().exec();
  }
}