import { Body, Controller, Get, Post } from '@nestjs/common';
import { WorkService } from './work.service';
import { Work } from './Work'
import { CreateWorkDto } from './work.dto';

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

  @Post()
  async syncWorks(@Body() workDtos: CreateWorkDto[], )

  @Get('all')
  async getAllWorks(): Promise<Work[]> {
    return await this.workService.findAll();
  }
}