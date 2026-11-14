
"use client";

import {
  type CalendarEventType,
  useEventStore,
  useViewStore,
  useDateStore,
} from "@/lib/store";
import MonthView from "./month-view";
import SideBar from "./sidebar/SideBar";
import WeekView from "./week-view";
import DayView from "./day-view";
import EventSummaryPopover from "./event-summary-popover";
import { useEffect } from "react";
import type { EventException } from "@/lib/recurrence";
import dayjs from "dayjs";
import { generateRecurringOccurrences } from "@/lib/recurrence";
import {
  DEFAULT_EVENT_CATEGORY,
  isEventCategory,
} from "@/lib/event-categories";

export default function MainView({
  eventsData,
  exceptionsData,
}: {
  eventsData: CalendarEventType[];
  exceptionsData: EventException[];
}) {
  const { selectedView } = useViewStore();
  const { userSelectedDate } = useDateStore();

  const {
    isEventSummaryOpen,
    closeEventSummary,
    selectedEvent,
    setEvents,
  } = useEventStore();
  const visibleRange = (() => {
    switch (selectedView) {
      case "day":
        return {
          start: userSelectedDate.startOf("day"),
          end: userSelectedDate.endOf("day"),
        };
      
      case "week":
        return {
          start: userSelectedDate.startOf("week"),
          end: userSelectedDate.endOf("week"),
        };
      
      case "month":
      default:
        return {
          start: userSelectedDate.startOf("month").startOf("week"),
          end: userSelectedDate.endOf("month").endOf("week"),
        };
    }
  })();
  useEffect(() => {
  const mappedEvents = generateRecurringOccurrences(
    eventsData.map((event) => ({
      ...event,
      date: dayjs(event.date).toDate(),
      endDate: dayjs(event.endDate).toDate(),
      recurrenceRule: event.recurrenceRule ?? null,
      recurrenceTimezone: event.recurrenceTimezone ?? null,
    })),
    visibleRange.start.toDate(),
    visibleRange.end.toDate(),
    exceptionsData,
  );

  const calendarEvents: CalendarEventType[] = mappedEvents.map((event) => ({
    id: event.id,
    date: event.date,
    endDate: event.endDate,
    title: event.title,
    description: event.description,
    category: isEventCategory(event.category)
      ? event.category
      : DEFAULT_EVENT_CATEGORY,
    recurrenceRule: event.recurrenceRule,
    recurrenceTimezone: event.recurrenceTimezone,
    occurrenceKey: event.occurrenceKey,
    originalStart: event.originalStart,
    isOccurrence: event.isOccurrence,
  }));

  setEvents(calendarEvents);
}, [eventsData, exceptionsData, setEvents, userSelectedDate,selectedView,]);

  return (
    <div className="flex">
      <SideBar />

      <div className="w-full flex-1">
        {selectedView === "month" && <MonthView />}
        {selectedView === "week" && <WeekView />}
        {selectedView === "day" && <DayView />}
      </div>

      {isEventSummaryOpen && selectedEvent && (
        <EventSummaryPopover
          isOpen={isEventSummaryOpen}
          onClose={closeEventSummary}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
