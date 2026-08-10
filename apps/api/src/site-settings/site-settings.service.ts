import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import { siteSettings, UpdateSiteSettings } from '../db/schema/site-settings';

@Injectable()
export class SiteSettingsService {
  constructor(@Inject(DB) private db: PostgresJsDatabase<typeof schema>) {}

  async getOrCreate() {
    const rows = await this.db.select().from(siteSettings).limit(1);
    if (rows.length) return rows[0];

    const created = await this.db.insert(siteSettings).values({}).returning();
    return created[0];
  }

  async update(data: UpdateSiteSettings) {
    const row = await this.getOrCreate();
    const updated = await this.db
      .update(siteSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteSettings.id, row.id))
      .returning();
    return updated[0];
  }
}
