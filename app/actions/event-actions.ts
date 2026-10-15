'use server'

import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ✅ CREATE
export async function createEvent(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  if (!title || !description || !date || !time) {
    return { error: "All fields are required" };
  }

  const dateTime = new Date(`${date}T${time}:00`);

  try {
    await db.insert(eventsTable).values({
      title,
      description,
      date: dateTime,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event" };
  }
}

// ✅ UPDATE EVENT
export async function updateEvent(
  id: number,
  updatedData: { title?: string; description?: string; date?: Date }
): Promise<{ error?: string; success?: boolean }> {
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

// ✅ DELETE EVENT
export async function deleteEvent(id: number): Promise<{ error?: string; success?: boolean }> {
  try {
    await db.delete(eventsTable).where(eq(eventsTable.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { error: "Failed to delete event" };
  }
}
