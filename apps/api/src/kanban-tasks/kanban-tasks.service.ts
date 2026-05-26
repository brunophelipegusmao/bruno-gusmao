import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import { kanbanTasks, InsertKanbanTask, UpdateKanbanTask } from '../db/schema/kanban-tasks';

@Injectable()
export class KanbanTasksService {
  constructor(@Inject(DB) private db: PostgresJsDatabase<typeof schema>) {}

  findAll() {
    return this.db.select().from(kanbanTasks).orderBy(kanbanTasks.createdAt);
  }

  create(data: InsertKanbanTask) {
    return this.db.insert(kanbanTasks).values(data).returning();
  }

  async update(id: string, data: UpdateKanbanTask) {
    return this.db
      .update(kanbanTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(kanbanTasks.id, id))
      .returning();
  }

  remove(id: string) {
    return this.db.delete(kanbanTasks).where(eq(kanbanTasks.id, id)).returning();
  }
}
