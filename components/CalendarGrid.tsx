
"use client";

import { useEventStore } from "@/lib/store";
import dayjs from "dayjs";
import {
  DEFAULT_EVENT_CATEGORY,
  EVENT_CATEGORY_STYLES,
  isEventCategory,
} from "@/lib/event-categories";

export default function CalendarGrid() {
  const {
    events,
    openEventSummary,
    eventSearchQuery,
    categoryFilter,
  } = useEventStore();

  const query = eventSearchQuery.trim().toLowerCase();

  const filteredEvents = events.filter((event) => {
    const category = isEventCategory(event.category)
      ? event.category
      : DEFAULT_EVENT_CATEGORY;

    const matchesCategory =
      categoryFilter === "All" || category === categoryFilter;

    const matchesSearch =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className="mt-10 text-center text-gray-500">
        {events.length === 0
          ? "No events yet. Create an event to get started."
          : "No events match your search or selected category."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {filteredEvents.map((event) => {
        const category = isEventCategory(event.category)
          ? event.category
          : DEFAULT_EVENT_CATEGORY;
        const style = EVENT_CATEGORY_STYLES[category];

        return (
          <div
            key={event.id}
            onClick={() => openEventSummary(event)}
            className="cursor-pointer rounded-lg border p-3 shadow-sm transition hover:shadow-md"
            style={{
              backgroundColor: style.backgroundColor,
              borderColor: `${style.color}60`,
            }}
          >
            <h3 className="font-semibold" style={{ color: style.color }}>
              {event.title}
            </h3>

            <span
              className="mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: "white",
                color: style.color,
              }}
            >
              {style.label}
            </span>

            <p className="mt-1 text-sm text-gray-600">
              {dayjs(event.date).format("DD MMM YYYY")}
            </p>

            {event.location && (
              <p className="mt-1 text-xs text-gray-500">{event.location}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
