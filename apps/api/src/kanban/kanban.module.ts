import { Module } from '@nestjs/common';
import { KanbanGateway } from './kanban.gateway';
import { ProjectsModule } from '../projects/projects.module';
import { PostsModule } from '../posts/posts.module';
import { KanbanTasksModule } from '../kanban-tasks/kanban-tasks.module';

@Module({
  imports: [ProjectsModule, PostsModule, KanbanTasksModule],
  providers: [KanbanGateway],
})
export class KanbanModule {}
