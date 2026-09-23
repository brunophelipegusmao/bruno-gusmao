import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { auth } from '../auth/auth';
import type { SelectTodo } from '../db/schema/todos';

type TaggedClient = WebSocket & { userId?: string };

@WebSocketGateway({ cors: { origin: process.env.WEB_URL ?? 'http://localhost:3000' } })
export class TodosGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: TaggedClient, request: IncomingMessage) {
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
    });

    if (!session?.user) {
      client.close(1008, 'Unauthorized');
      return;
    }

    client.userId = session.user.id;
  }

  broadcast(event: 'todo-created' | 'todo-updated' | 'todo-deleted', todo: SelectTodo) {
    this.server.clients?.forEach((raw) => {
      const client = raw as TaggedClient;
      if (client.readyState !== 1) return;
      if (todo.shared || client.userId === todo.ownerId) {
        client.send(JSON.stringify({ event, data: todo }));
      }
    });
  }
}
