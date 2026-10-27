
"use client";

import { type CalendarEventType, useEventStore } from "@/lib/store";
import dayjs from "dayjs";
import React, { useState } from "react";
import EventSummaryPopover from "./event-summary-popover";
import {
  DEFAULT_EVENT_CATEGORY,
  EVENT_CATEGORY_STYLES,
  isEventCategory,
} from "@/lib/event-categories";

type EventRendererProps = {
  date: dayjs.Dayjs;
  view: "month" | "week" | "day";
  events: CalendarEventType[];
};

export function EventRenderer({ date, view, events }: EventRendererProps) {
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventType | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { eventSearchQuery, categoryFilter } = useEventStore();

  const normalizedQuery = eventSearchQuery.trim().toLowerCase();

  const filteredEvents = events.filter((event) => {
    const matchesDate =
      view === "month"
        ? event.date.format("DD-MM-YY") === date.format("DD-MM-YY")
        : event.date.format("DD-MM-YY HH") === date.format("DD-MM-YY HH");

    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;

    const matchesSearch =
      !normalizedQuery ||
      event.title.toLowerCase().includes(normalizedQuery) ||
      event.description.toLowerCase().includes(normalizedQuery) ||
      (isEventCategory(event.category) &&
        event.category.toLowerCase().includes(normalizedQuery));

    return matchesDate && matchesCategory && matchesSearch;
  });

  return (
    <>
      {filteredEvents.map((event) => {
        const category = isEventCategory(event.category)
          ? event.category
          : DEFAULT_EVENT_CATEGORY;
        const categoryStyle = EVENT_CATEGORY_STYLES[category];

        return (
          <div
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
              setIsPopoverOpen(true);
            }}
            className="line-clamp-1 w-[90%] cursor-pointer rounded-sm p-1 text-sm font-medium"
            style={{
              backgroundColor: categoryStyle.backgroundColor,
              color: categoryStyle.color,
              borderLeft: `3px solid ${categoryStyle.color}`,
            }}
            title={`${event.title} · ${category}`}
          >
            {event.title}
          </div>
        );
      })}

      {selectedEvent && (
        <EventSummaryPopover
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          event={selectedEvent}
        />
      )}
    </>
  );
}
