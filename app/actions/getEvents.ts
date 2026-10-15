'use server'

import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getEvents() {
  try {
    const events = await db
      .select()
      .from(eventsTable)
      .orderBy(desc(eventsTable.date));
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
