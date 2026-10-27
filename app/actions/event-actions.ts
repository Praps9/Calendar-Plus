
"use server";

import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { and, eq, lt, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_EVENT_CATEGORY,
  isEventCategory,
} from "@/lib/event-categories";

type EventConflict = {
  id: number;
  title: string;
  date: string;
  endDate: string;
};

type EventActionResult = {
  error?: string;
  success?: boolean;
  conflicts?: EventConflict[];
};

async function findConflicts(
  start: Date,
  end: Date,
  excludeId?: number
): Promise<EventConflict[]> {
  const conditions = [
    lt(eventsTable.date, end),
    gt(eventsTable.endDate, start),
  ];

  if (excludeId !== undefined) {
    conditions.push(ne(eventsTable.id, excludeId));
  }

  const rows = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      date: eventsTable.date,
      endDate: eventsTable.endDate,
    })
    .from(eventsTable)
    .where(and(...conditions));

  return rows.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date.toISOString(),
    endDate: event.endDate.toISOString(),
  }));
}

// CREATE EVENT
export async function createEvent(
  formData: FormData,
  confirmConflicts = false
): Promise<EventActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const rawCategory = formData.get("category");
  const category =
    rawCategory === null || rawCategory === ""
      ? DEFAULT_EVENT_CATEGORY
      : rawCategory;

  if (!title || !description || !date || !time || !endTime) {
    return { error: "All fields are required" };
  }

  if (!isEventCategory(category)) {
    return { error: "Invalid event category" };
  }

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(`${date}T${endTime}:00`);

  if (
    Number.isNaN(startDateTime.getTime()) ||
    Number.isNaN(endDateTime.getTime())
  ) {
    return { error: "Invalid event date or time" };
  }

  if (endDateTime <= startDateTime) {
    return { error: "End time must be later than start time" };
  }

  try {
    const conflicts = await findConflicts(startDateTime, endDateTime);

    if (conflicts.length > 0 && !confirmConflicts) {
      return { conflicts };
    }

    await db.insert(eventsTable).values({
      title,
      description,
      date: startDateTime,
      endDate: endDateTime,
      category,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event" };
  }
}

// UPDATE EVENT
export async function updateEvent(
  id: number,
  updatedData: {
    title?: string;
    description?: string;
    date?: Date;
    endDate?: Date;
    category?: string;
  },
  confirmConflicts = false
): Promise<EventActionResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Invalid event ID" };
  }

  if (
    updatedData.category !== undefined &&
    !isEventCategory(updatedData.category)
  ) {
    return { error: "Invalid event category" };
  }

  if (updatedData.title !== undefined && !updatedData.title.trim()) {
    return { error: "Event title is required" };
  }

  if (
    updatedData.date !== undefined &&
    Number.isNaN(updatedData.date.getTime())
  ) {
    return { error: "Invalid event start date or time" };
  }

  if (
    updatedData.endDate !== undefined &&
    Number.isNaN(updatedData.endDate.getTime())
  ) {
    return { error: "Invalid event end date or time" };
  }

  try {
    const [existing] = await db
      .select({
        date: eventsTable.date,
        endDate: eventsTable.endDate,
      })
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!existing) {
      return { error: "Event not found" };
    }

    const startDateTime = updatedData.date ?? existing.date;
    const endDateTime = updatedData.endDate ?? existing.endDate;

    if (endDateTime <= startDateTime) {
      return { error: "End time must be later than start time" };
    }

    const conflicts = await findConflicts(startDateTime, endDateTime, id);

    if (conflicts.length > 0 && !confirmConflicts) {
      return { conflicts };
    }

    await db
      .update(eventsTable)
      .set(updatedData)
      .where(eq(eventsTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { error: "Failed to update event" };
  }
}

// DELETE EVENT
export async function deleteEvent(
  id: number
): Promise<{ error?: string; success?: boolean }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Invalid event ID" };
  }

  try {
    await db.delete(eventsTable).where(eq(eventsTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { error: "Failed to delete event" };
  }
}
