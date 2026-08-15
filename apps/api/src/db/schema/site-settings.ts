import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventPopupEnabled: boolean('event_popup_enabled').notNull().default(false),
  eventName: varchar('event_name', { length: 100 }).notNull().default('Evento'),
  eventDescription: varchar('event_description', { length: 500 }),
  eventImageUrl: varchar('event_image_url', { length: 2048 }),
  eventBgColor: varchar('event_bg_color', { length: 50 })
    .notNull()
    .default('#1e293b'),
  eventTextColor: varchar('event_text_color', { length: 50 })
    .notNull()
    .default('#e2e8f0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings, {
  eventPopupEnabled: z.boolean().optional(),
  eventName: z.string().min(1).max(100).optional(),
  eventDescription: z.string().max(500).optional().nullable(),
  eventImageUrl: z.string().url().max(2048).optional().nullable(),
  eventBgColor: z.string().min(1).max(50).optional(),
  eventTextColor: z.string().min(1).max(50).optional(),
}).omit({ id: true, updatedAt: true });

export const updateSiteSettingsSchema = insertSiteSettingsSchema.partial();
export const selectSiteSettingsSchema = createSelectSchema(siteSettings);

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type SelectSiteSettings = z.infer<typeof selectSiteSettingsSchema>;
