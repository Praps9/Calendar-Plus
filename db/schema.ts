
import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { DEFAULT_EVENT_CATEGORY } from "@/lib/event-categories";

// Events table schema
export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category")
    .notNull()
    .default(DEFAULT_EVENT_CATEGORY),
});
