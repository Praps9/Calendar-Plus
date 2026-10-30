
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import Header from "@/components/header/Header";
import MainView from "@/components/MainView";
import { CalendarEventType } from "@/lib/store";
import { eq, desc } from "drizzle-orm";
import dayjs from "dayjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const sessionUserId = session?.user?.id;

  if (!sessionUserId) {
    redirect("/login");
  }

  const userId = Number(sessionUserId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    redirect("/login");
  }

  let dbEvents: CalendarEventType[] = [];

  try {
    const data = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.userId, userId))
      .orderBy(desc(eventsTable.date));

    dbEvents = data.map((event) => ({
      ...event,
      date: dayjs(event.date).toISOString(),
      endDate: dayjs(event.endDate).toISOString(),
    })) as unknown as CalendarEventType[];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
  }

  return (
    <div>
      <Header />
      <MainView eventsData={dbEvents} />
    </div>
  );
}
