import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { KANBAN_STATUSES } from './projects';

export const TASK_TYPES = ['blog', 'project', 'custom'] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const kanbanTasks = pgTable('kanban_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  taskType: varchar('task_type', { length: 50 }).notNull().default('blog'),
  color: varchar('color', { length: 50 }),
  kanbanStatus: varchar('kanban_status', { length: 50 }).notNull().default('backlog'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertKanbanTaskSchema = createInsertSchema(kanbanTasks, {
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  taskType: z.enum(TASK_TYPES).optional(),
  color: z.string().max(50).optional().nullable(),
  kanbanStatus: z.enum(KANBAN_STATUSES).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateKanbanTaskSchema = insertKanbanTaskSchema.partial();
export const selectKanbanTaskSchema = createSelectSchema(kanbanTasks);

export type InsertKanbanTask = z.infer<typeof insertKanbanTaskSchema>;
export type UpdateKanbanTask = z.infer<typeof updateKanbanTaskSchema>;
export type SelectKanbanTask = z.infer<typeof selectKanbanTaskSchema>;
