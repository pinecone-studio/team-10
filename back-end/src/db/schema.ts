import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  object_key: text("object_key").notNull(),
  file_name: text("file_name").notNull(),
  content_type: text("content_type").notNull(),
  file_size: integer("file_size").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  is_completed: integer("is_completed").notNull(),
  image_object_key: text("image_object_key"),
  image_file_name: text("image_file_name"),
  image_content_type: text("image_content_type"),
  image_file_size: integer("image_file_size"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});
