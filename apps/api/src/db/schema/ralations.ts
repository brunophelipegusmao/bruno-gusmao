import { relations } from 'drizzle-orm';
import { badges } from './badges';
import { posts } from './posts';
import { projects } from './projects';

export const postsRelations = relations(posts, ({ one }) => ({
  badge1: one(badges, {
    fields: [posts.badge1Id],
    references: [badges.id],
    relationName: 'badge1',
  }),
  badge2: one(badges, {
    fields: [posts.badge2Id],
    references: [badges.id],
    relationName: 'badge2',
  }),
  badge3: one(badges, {
    fields: [posts.badge3Id],
    references: [badges.id],
    relationName: 'badge3',
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  badge1: one(badges, {
    fields: [projects.badge1Id],
    references: [badges.id],
    relationName: 'projectBadge1',
  }),
  badge2: one(badges, {
    fields: [projects.badge2Id],
    references: [badges.id],
    relationName: 'projectBadge2',
  }),
  badge3: one(badges, {
    fields: [projects.badge3Id],
    references: [badges.id],
    relationName: 'projectBadge3',
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  postsAsBadge1: many(posts, { relationName: 'badge1' }),
  postsAsBadge2: many(posts, { relationName: 'badge2' }),
  postsAsBadge3: many(posts, { relationName: 'badge3' }),
  projectsAsBadge1: many(projects, { relationName: 'projectBadge1' }),
  projectsAsBadge2: many(projects, { relationName: 'projectBadge2' }),
  projectsAsBadge3: many(projects, { relationName: 'projectBadge3' }),
}));
