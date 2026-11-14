
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eventsTable , eventExceptionsTable } from "@/db/schema";
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
  let dbExceptions: {
    eventId: number;
    originalStart: string;
    isCancelled: boolean;
    date: string | null;
    endDate: string | null;
    title: string | null;
    description: string | null;
    category: string | null;
  }[] = [];

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
    const exceptionData = await db
  .select({
    eventId: eventExceptionsTable.eventId,
    originalStart: eventExceptionsTable.originalStart,
    isCancelled: eventExceptionsTable.isCancelled,
    date: eventExceptionsTable.date,
    endDate: eventExceptionsTable.endDate,
    title: eventExceptionsTable.title,
    description: eventExceptionsTable.description,
    category: eventExceptionsTable.category,
  })
  .from(eventExceptionsTable)
  .innerJoin(
    eventsTable,
    eq(eventExceptionsTable.eventId, eventsTable.id),
  )
  .where(eq(eventsTable.userId, userId));

dbExceptions = exceptionData.map((exception) => ({
  ...exception,
  originalStart: exception.originalStart.toISOString(),
  date: exception.date?.toISOString() ?? null,
  endDate: exception.endDate?.toISOString() ?? null,
}));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
  }

  return (
    <div>
      <Header />
      <MainView
      eventsData={dbEvents}
      exceptionsData={dbExceptions}
      />
    </div>
  );
}
