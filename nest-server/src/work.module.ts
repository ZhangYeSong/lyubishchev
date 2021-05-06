import { Module } from '@nestjs/common';
import { WorkController } from './work.controller';
import { WorkService } from './work.service';
import { workProviders } from './work.providers';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkController],
  providers: [
    WorkService,
    ...workProviders,
  ],
})
export class WorkModule {}