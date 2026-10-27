import { pgTable, serial, timestamp, text, real } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const events = pgTable("events", {
	id: serial("id").primaryKey().notNull(),
	date: timestamp("date", { mode: 'string' }).notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	category: text("category").default('Other').notNull(),
});

export const playingWithNeon = pgTable("playing_with_neon", {
	id: serial("id").primaryKey().notNull(),
	name: text("name").notNull(),
	value: real("value"),
});