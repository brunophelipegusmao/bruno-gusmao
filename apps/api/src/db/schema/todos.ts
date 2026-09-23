import { pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './user';

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  done: boolean('done').notNull().default(false),
  shared: boolean('shared').notNull().default(false),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const todoFieldRefinements = {
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  done: z.boolean().optional(),
};

export const insertTodoSchema = createInsertSchema(todos, todoFieldRefinements)
  .omit({ id: true, createdAt: true, updatedAt: true, ownerId: true })
  .extend({ shared: z.boolean().default(false) });

// Não deriva de insertTodoSchema.partial(): o `.default(false)` de `shared`
// sobreviveria ao `.partial()` e um PATCH que não envia `shared` acabaria
// resetando o campo para false silenciosamente.
export const updateTodoSchema = createInsertSchema(todos, todoFieldRefinements)
  .omit({ id: true, createdAt: true, updatedAt: true, ownerId: true })
  .extend({ shared: z.boolean().optional() })
  .partial();

export const selectTodoSchema = createSelectSchema(todos);

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type SelectTodo = z.infer<typeof selectTodoSchema>;
