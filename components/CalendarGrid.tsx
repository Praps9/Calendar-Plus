import { useEventStore } from "@/lib/store";
import dayjs from "dayjs";

export default function CalendarGrid() {
  const { events, openEventSummary } = useEventStore();

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No events yet. Click “Add Event” to create one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => openEventSummary(event)}
          className="bg-blue-100 hover:bg-blue-200 transition cursor-pointer p-3 rounded-lg shadow-sm border border-blue-200"
        >
          <h3 className="font-semibold text-blue-800">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {dayjs(event.date).format("DD MMM YYYY")}
          </p>
          {event.location && (
            <p className="text-xs text-gray-500 mt-1">{event.location}</p>
          )}
        </div>
      ))}
    </div>
  );
}
