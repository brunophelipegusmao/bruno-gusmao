import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import {
  badges,
  InsertBadge,
  UpdateBadge,
} from '../db/schema/badges';

@Injectable()
export class BadgesService {
  constructor(@Inject(DB) private db: PostgresJsDatabase<typeof schema>) {}

  findAll() {
    return this.db.select().from(badges).orderBy(badges.name);
  }

  findOne(id: string) {
    return this.db.select().from(badges).where(eq(badges.id, id));
  }

  create(data: InsertBadge) {
    return this.db.insert(badges).values(data).returning();
  }

  update(id: string, data: UpdateBadge) {
    return this.db.update(badges).set(data).where(eq(badges.id, id)).returning();
  }

  remove(id: string) {
    return this.db.delete(badges).where(eq(badges.id, id)).returning();
  }
}
