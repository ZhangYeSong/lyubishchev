import { Controller, Get, Post } from '@nestjs/common';
import { WorkService } from './work.service';
import { Work } from './Work'

@Controller()
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Get()
  helloWork(): string {
      return "hello works";
  }

  @Get('all')
  async getAllWorks(): Promise<Work[]> {
    return await this.workService.findAll();
  }
}