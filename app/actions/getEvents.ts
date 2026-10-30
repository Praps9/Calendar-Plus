
"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getEvents() {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId) {
      return [];
    }

    const userId = Number(sessionUserId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return [];
    }

    const events = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.userId, userId))
      .orderBy(desc(eventsTable.date));

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
