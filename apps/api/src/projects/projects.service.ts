import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import { projects, InsertProject, UpdateProject } from '../db/schema/projects';

@Injectable()
export class ProjectsService {
  constructor(@Inject(DB) private db: PostgresJsDatabase<typeof schema>) {}

  findAllPublic() {
    return this.db
      .select()
      .from(projects)
      .where(and(eq(projects.visible, true)))
      .orderBy(desc(projects.featured), projects.createdAt);
  }

  findAll() {
    return this.db.select().from(projects)
      .orderBy(desc(projects.featured), projects.createdAt);
  }

  findOne(id: string) {
    return this.db.select().from(projects).where(eq(projects.id, id));
  }

  create(data: InsertProject) {
    return this.db.insert(projects).values(data).returning();
  }

  async update(id: string, data: UpdateProject) {
    return this.db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
  }

  remove(id: string) {
    return this.db.delete(projects).where(eq(projects.id, id)).returning();
  }
}
