"use client";
import {
  CalendarEventType,
  useEventStore,
  useViewStore,
} from "@/lib/store";
import MonthView from "./month-view";
import SideBar from "./sidebar/SideBar";
import WeekView from "./week-view";
import DayView from "./day-view";
import  EventSummaryPopover  from "./event-summary-popover";
import { useEffect } from "react";
import dayjs from "dayjs";

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
      title: event.title,
      description: event.description,
    }));

    setEvents(mappedEvents);
  }, [eventsData, setEvents]);

  return (
    <div className="flex">
      {/* SideBar */}
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
