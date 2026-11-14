import { RRule } from "rrule";
import dayjs from "dayjs";

export type RecurrenceEvent = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: Date | string;
  endDate: Date | string;
  recurrenceRule: string | null;
  recurrenceTimezone: string | null;
};

export type EventException = {
  eventId: number;
  originalStart: Date | string;
  isCancelled: boolean;
  date: Date | string | null;
  endDate: Date | string | null;
  title: string | null;
  description: string | null;
  category: string | null;
};

export type GeneratedOccurrence = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  recurrenceRule: string | null;
  recurrenceTimezone: string | null;
  occurrenceKey: string;
  originalStart: dayjs.Dayjs;
  isOccurrence: boolean;
};

function getZonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    millisecond: date.getUTCMilliseconds(),
  };
}

function toWallClockDate(date: Date, timezone: string): Date {
  const parts = getZonedParts(date, timezone);

  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      parts.millisecond,
    ),
  );
}

function wallClockToUtc(wallClockDate: Date, timezone: string): Date {
  const targetTime = wallClockDate.getTime();
  let result = targetTime;

  for (let i = 0; i < 4; i++) {
    const actualParts = getZonedParts(new Date(result), timezone);

    const actualWallTime = Date.UTC(
      actualParts.year,
      actualParts.month - 1,
      actualParts.day,
      actualParts.hour,
      actualParts.minute,
      actualParts.second,
      actualParts.millisecond,
    );

    result += targetTime - actualWallTime;
  }

  return new Date(result);
}

export function generateRecurringOccurrences(
  events: RecurrenceEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptions: EventException[] = [],
): GeneratedOccurrence[] {
  const occurrences: GeneratedOccurrence[] = [];

  for (const event of events) {
    const eventStart = new Date(event.date);
    const eventEnd = new Date(event.endDate);

    if (!event.recurrenceRule) {
      if (eventStart <= rangeEnd && eventEnd >= rangeStart) {
        occurrences.push({
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          date: dayjs(eventStart),
          endDate: dayjs(eventEnd),
          recurrenceRule: null,
          recurrenceTimezone: null,
          occurrenceKey: `event-${event.id}`,
          originalStart: dayjs(eventStart),
          isOccurrence: false,
        });
      }

      continue;
    }

    const timezone = event.recurrenceTimezone || "UTC";
    const duration = eventEnd.getTime() - eventStart.getTime();

    const wallStart = toWallClockDate(eventStart, timezone);
    const wallRangeStart = toWallClockDate(
      new Date(rangeStart.getTime() - duration),
      timezone,
    );
    const wallRangeEnd = toWallClockDate(rangeEnd, timezone);

    const parsedRule = RRule.parseString(event.recurrenceRule);

    const rule = new RRule({
      ...parsedRule,
      dtstart: wallStart,
    });

    const generatedDates = rule.between(
      wallRangeStart,
      wallRangeEnd,
      true,
    );

    const eventExceptions = exceptions.filter(
      (exception) => exception.eventId === event.id,
    );

    for (const wallOccurrence of generatedDates) {
      const occurrenceStart = wallClockToUtc(
        wallOccurrence,
        timezone,
      );

      const originalStart = occurrenceStart.toISOString();

      const exception = eventExceptions.find(
        (item) =>
          new Date(item.originalStart).toISOString() === originalStart,
      );

      if (exception?.isCancelled) continue;

      const occurrenceEnd = new Date(
        occurrenceStart.getTime() + duration,
      );

      const finalStart = exception?.date
        ? new Date(exception.date)
        : occurrenceStart;

      const finalEnd = exception?.endDate
        ? new Date(exception.endDate)
        : exception?.date
          ? new Date(finalStart.getTime() + duration)
          : occurrenceEnd;

      if (finalStart > rangeEnd || finalEnd < rangeStart) continue;

      occurrences.push({
        id: event.id,
        title: exception?.title ?? event.title,
        description: exception?.description ?? event.description,
        category: exception?.category ?? event.category,
        date: dayjs(finalStart),
        endDate: dayjs(finalEnd),
        recurrenceRule: event.recurrenceRule,
        recurrenceTimezone: timezone,
        occurrenceKey: `event-${event.id}-${originalStart}`,
        originalStart: dayjs(occurrenceStart),
        isOccurrence: true,
      });
    }
  }

  return occurrences.sort(
    (a, b) => a.date.valueOf() - b.date.valueOf(),
  );
}