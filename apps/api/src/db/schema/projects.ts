import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { badges } from './badges';

export const KANBAN_STATUSES = ['backlog', 'todo', 'in-progress', 'done'] as const;
export type KanbanStatus = typeof KANBAN_STATUSES[number];

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: varchar('summary', { length: 300 }).notNull(),
  image: varchar('image', { length: 2048 }),
  projectUrl: varchar('project_url', { length: 2048 }),
  repoUrl: varchar('repo_url', { length: 2048 }),
  badge1Id: uuid('badge1_id').references(() => badges.id, {
    onDelete: 'set null',
  }),
  badge2Id: uuid('badge2_id').references(() => badges.id, {
    onDelete: 'set null',
  }),
  badge3Id: uuid('badge3_id').references(() => badges.id, {
    onDelete: 'set null',
  }),
  visible: boolean('visible').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  kanbanStatus: varchar('kanban_status', { length: 50 }).notNull().default('backlog'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'slug: only lowercase, numbers and hyphens'),
  summary: z.string().min(1).max(300),
  image: z.string().url().optional().nullable(),
  projectUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  kanbanStatus: z.enum(KANBAN_STATUSES).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateProjectSchema = insertProjectSchema.partial();
export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type SelectProject = z.infer<typeof selectProjectSchema>;
