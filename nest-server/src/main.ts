import { NestFactory } from '@nestjs/core';
import { WorkModule } from './work.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkModule);
  await app.listen(3000);
}
bootstrap();
