import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  bgColor: varchar('bg_color', { length: 50 }).notNull().default('#1e293b'),
  textColor: varchar('text_color', { length: 50 }).notNull().default('#e2e8f0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges, {
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'slug: only lowercase, numbers and hyphens'),
  bgColor: z.string().min(1).max(50).optional(),
  textColor: z.string().min(1).max(50).optional(),
}).omit({ id: true, createdAt: true });

export const updateBadgeSchema = insertBadgeSchema.partial();
export const selectBadgeSchema = createSelectSchema(badges);

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UpdateBadge = z.infer<typeof updateBadgeSchema>;
export type SelectBadge = z.infer<typeof selectBadgeSchema>;
