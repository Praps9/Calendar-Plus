
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

import { DEFAULT_EVENT_CATEGORY } from "@/lib/event-categories";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique("users_email_key"),
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

  recurrenceRule: text("recurrence_rule"),
  recurrenceTimezone: text("recurrence_timezone"),
});

export const eventExceptionsTable = pgTable(
  "event_exceptions",
  {
    id: serial("id").primaryKey(),

    eventId: integer("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),

    originalStart: timestamp("original_start").notNull(),

    isCancelled: boolean("is_cancelled").notNull().default(false),

    date: timestamp("date"),
    endDate: timestamp("end_date"),
    title: text("title"),
    description: text("description"),
    category: text("category"),
  },
  (table) => ({
    eventOriginalStartUnique: unique(
      "event_exceptions_event_original_start_unique"
    ).on(table.eventId, table.originalStart),
  })
);
