import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { DB } from '../db/db.module';
import { posts, InsertPost, UpdatePost } from '../db/schema/posts';

@Injectable()
export class PostsService {
  constructor(@Inject(DB) private db: PostgresJsDatabase<typeof schema>) {}

  findAllPublic() {
    return this.db
      .select()
      .from(posts)
      .where(and(eq(posts.visible, true)))
      .orderBy(desc(posts.featured), posts.createdAt);
  }

  findAll() {
    return this.db.select().from(posts)
      .orderBy(desc(posts.featured), posts.createdAt);
  }

  findOne(id: string) {
    return this.db.select().from(posts).where(eq(posts.id, id));
  }

  findBySlug(slug: string) {
    return this.db.select().from(posts).where(eq(posts.slug, slug));
  }

  create(data: InsertPost) {
    return this.db.insert(posts).values(data).returning();
  }

  async update(id: string, data: UpdatePost) {
    return this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
  }

  remove(id: string) {
    return this.db.delete(posts).where(eq(posts.id, id)).returning();
  }
}
