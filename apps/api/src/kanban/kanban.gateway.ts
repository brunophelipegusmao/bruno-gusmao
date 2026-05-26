import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { ProjectsService } from '../projects/projects.service';
import { PostsService } from '../posts/posts.service';
import { KanbanTasksService } from '../kanban-tasks/kanban-tasks.service';
import { KanbanStatus } from '../db/schema/projects';

interface MoveCardDto {
  id: string;
  type: 'project' | 'post' | 'task';
  to: KanbanStatus;
}

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000' } })
export class KanbanGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly postsService: PostsService,
    private readonly kanbanTasksService: KanbanTasksService,
  ) {}

  @SubscribeMessage('move-card')
  async handleMoveCard(@MessageBody() data: MoveCardDto) {
    const { id, type, to } = data;

    if (type === 'project') {
      await this.projectsService.update(id, { kanbanStatus: to });
    } else if (type === 'post') {
      await this.postsService.update(id, { kanbanStatus: to });
    } else {
      await this.kanbanTasksService.update(id, { kanbanStatus: to });
    }

    this.server.clients?.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ event: 'card-moved', data }));
      }
    });
  }
}
