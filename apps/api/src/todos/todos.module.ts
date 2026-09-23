import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosGateway } from './todos.gateway';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodosGateway],
})
export class TodosModule {}
