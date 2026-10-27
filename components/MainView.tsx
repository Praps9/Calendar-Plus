
"use client";

import {
  type CalendarEventType,
  useEventStore,
  useViewStore,
} from "@/lib/store";
import MonthView from "./month-view";
import SideBar from "./sidebar/SideBar";
import WeekView from "./week-view";
import DayView from "./day-view";
import EventSummaryPopover from "./event-summary-popover";
import { useEffect } from "react";
import dayjs from "dayjs";
import {
  DEFAULT_EVENT_CATEGORY,
  isEventCategory,
} from "@/lib/event-categories";

export default function MainView({
  eventsData,
}: {
  eventsData: CalendarEventType[];
}) {
  const { selectedView } = useViewStore();

  const {
    isEventSummaryOpen,
    closeEventSummary,
    selectedEvent,
    setEvents,
  } = useEventStore();

  useEffect(() => {
   const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
  id: event.id,
  date: dayjs(event.date),
  endDate: dayjs(event.endDate),
  title: event.title,
  description: event.description,
  category: isEventCategory(event.category)
    ? event.category
    : DEFAULT_EVENT_CATEGORY,
  location: event.location,
}));

    setEvents(mappedEvents);
  }, [eventsData, setEvents]);

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
