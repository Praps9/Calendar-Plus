
"use server";

import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_EVENT_CATEGORY,
  isEventCategory,
} from "@/lib/event-categories";

// CREATE EVENT
export async function createEvent(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const rawCategory = formData.get("category");
  const category =
    rawCategory === null || rawCategory === ""
      ? DEFAULT_EVENT_CATEGORY
      : rawCategory;

  if (!title || !description || !date || !time) {
    return { error: "All fields are required" };
  }

  if (!isEventCategory(category)) {
    return { error: "Invalid event category" };
  }

  const dateTime = new Date(`${date}T${time}:00`);

  if (Number.isNaN(dateTime.getTime())) {
    return { error: "Invalid event date or time" };
  }

  try {
    await db.insert(eventsTable).values({
      title,
      description,
      date: dateTime,
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
    category?: string;
  }
): Promise<{ error?: string; success?: boolean }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "Invalid event ID" };
  }

  if (
    updatedData.category !== undefined &&
    !isEventCategory(updatedData.category)
  ) {
    return { error: "Invalid event category" };
  }

  if (
    updatedData.title !== undefined &&
    !updatedData.title.trim()
  ) {
    return { error: "Event title is required" };
  }

  if (
    updatedData.date !== undefined &&
    Number.isNaN(updatedData.date.getTime())
  ) {
    return { error: "Invalid event date or time" };
  }

  try {
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
  try {
    await db.delete(eventsTable).where(eq(eventsTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { error: "Failed to delete event" };
  }
}
