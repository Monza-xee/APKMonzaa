import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appsTable = pgTable("apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  packageName: text("package_name").notNull(),
  version: text("version").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  description: text("description").notNull(),
  modFeatures: text("mod_features").notNull(),
  iconInitials: text("icon_initials").notNull(),
  iconColor: text("icon_color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppSchema = createInsertSchema(appsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof appsTable.$inferSelect;
