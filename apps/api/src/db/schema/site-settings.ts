import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventPopupEnabled: boolean('event_popup_enabled').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings, {
  eventPopupEnabled: z.boolean().optional(),
}).omit({ id: true, updatedAt: true });

export const updateSiteSettingsSchema = insertSiteSettingsSchema.partial();
export const selectSiteSettingsSchema = createSelectSchema(siteSettings);

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type SelectSiteSettings = z.infer<typeof selectSiteSettingsSchema>;
