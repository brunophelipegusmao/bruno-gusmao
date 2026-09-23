import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import { todos, InsertTodo, UpdateTodo } from '../db/schema/todos';
import { TodosGateway } from './todos.gateway';

@Injectable()
export class TodosService {
  constructor(
    @Inject(DB) private db: PostgresJsDatabase<typeof schema>,
    private readonly gateway: TodosGateway,
  ) {}

  findAllForUser(userId: string) {
    return this.db
      .select()
      .from(todos)
      .where(or(eq(todos.shared, true), eq(todos.ownerId, userId)))
      .orderBy(todos.createdAt);
  }

  async create(data: InsertTodo, userId: string) {
    const [row] = await this.db
      .insert(todos)
      .values({ ...data, ownerId: userId })
      .returning();
    this.gateway.broadcast('todo-created', row);
    return row;
  }

  private async assertMutable(id: string, userId: string) {
    const [row] = await this.db.select().from(todos).where(eq(todos.id, id));
    if (!row) throw new NotFoundException();
    if (!row.shared && row.ownerId !== userId) throw new ForbiddenException();
    return row;
  }

  async update(id: string, data: UpdateTodo, userId: string) {
    await this.assertMutable(id, userId);
    const [row] = await this.db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();
    this.gateway.broadcast('todo-updated', row);
    return row;
  }

  async remove(id: string, userId: string) {
    await this.assertMutable(id, userId);
    const [row] = await this.db.delete(todos).where(eq(todos.id, id)).returning();
    this.gateway.broadcast('todo-deleted', row);
    return row;
  }
}
