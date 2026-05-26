import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { badges } from './badges';
import { KANBAN_STATUSES } from './projects';

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: varchar('summary', { length: 300 }).notNull(),
  imageUrl: varchar('image_url', { length: 2048 }),
  content: text('content').notNull(),
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
  kanbanStatus: varchar('kanban_status', { length: 50 }).notNull().default('backlog'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts, {
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'slug: only lowercase, numbers and hyphens'),
  summary: z.string().min(1).max(300),
  imageUrl: z.string().url().optional().nullable(),
  content: z.string().min(1),
  badge1Id: z.string().uuid().optional().nullable(),
  badge2Id: z.string().uuid().optional().nullable(),
  badge3Id: z.string().uuid().optional().nullable(),
  visible: z.boolean().optional(),
  kanbanStatus: z.enum(KANBAN_STATUSES).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updatePostSchema = insertPostSchema.partial();
export const selectPostSchema = createSelectSchema(posts);

export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type SelectPost = z.infer<typeof selectPostSchema>;
