
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

import { DEFAULT_EVENT_CATEGORY } from "@/lib/event-categories";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isLegacy: boolean("is_legacy").notNull().default(false),
});

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category")
    .notNull()
    .default(DEFAULT_EVENT_CATEGORY),
});
