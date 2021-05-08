import { Body, Controller, Get, Post } from '@nestjs/common';
import { WorkService } from './work.service';
import { Work } from './work'
import { CreateWorkDto, SyncWorksDto } from './work.dto';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Get()
  helloWork(): string {
      return "hello works";
  }

  @Post()
  async createWork(@Body() workDto: CreateWorkDto) {
    await this.workService.create(workDto);
    return 'add success!'
  }

  @Post('sync')
  async syncWorks(@Body() syncDto: SyncWorksDto) {
    return await this.workService.syncWorks(syncDto);
  }

  @Get('all')
  async getAllWorks(): Promise<Work[]> {
    return await this.workService.findAll();
  }
}