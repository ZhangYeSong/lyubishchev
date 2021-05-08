import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Work } from './work';
import { CreateWorkDto, SyncWorksDto } from './work.dto';

@Injectable()
export class WorkService {
  constructor(
    @Inject('WORK_MODEL')
    private workModel: Model<Work>,
  ) {}

  async create(workDto: CreateWorkDto) {
    return await this.workModel.findOneAndUpdate({insertTime: workDto.insertTime}, 
      workDto, {upsert: true, new: true});
  }

  async syncWorks(syncDto: SyncWorksDto) {
    //1.删除用户上报的已删除数据
    await this.workModel.deleteMany({userId: syncDto.userId})
      .where('insertTime').in(syncDto.deletes).exec();

    //3.添加客户端数据
    for (let dto of syncDto.works) {
      await this.create(dto);
    }

    //3.查询用户在云端的数据
    return await this.workModel.find({userId: syncDto.userId}).exec();
  }

  async findAll(): Promise<Work[]> {
    return this.workModel.find().exec();
  }
}