import { updateEvent as updateEventServer } from "@/app/actions/event-actions";
import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React from "react";
import { EventRenderer } from "./event-renderer";

export default function MonthViewBox({
  day,
  rowIndex,
}: {
  day: dayjs.Dayjs | null;
  rowIndex: number;
}) {
  const {
  openEventForm,
  events,
  updateEvent: updateEventInStore,
} = useEventStore();
  const { setDate } = useDateStore();

  if (!day) {
    return (
      <div className="h-12 w-full border md:h-28 md:w-full lg:h-full"></div>
    );
  }

  const isFirstDayOfMonth = day.date() === 1;
  const isToday = day.format("DD-MM-YY") === dayjs().format("DD-MM-YY");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDate(day);
    openEventForm(); // ✅ replaced openPopover()
  };
const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();

  const eventId = Number(
    e.dataTransfer.getData("application/calendar-event-id")
  );

  const draggedEvent = events.find((event) => event.id === eventId);

  if (!draggedEvent) return;

  const duration = draggedEvent.endDate.diff(draggedEvent.date);
  const newStart = day
    .hour(draggedEvent.date.hour())
    .minute(draggedEvent.date.minute())
    .second(draggedEvent.date.second())
    .millisecond(draggedEvent.date.millisecond());

  const newEnd = newStart.add(duration, "millisecond");

  if (newStart.isSame(draggedEvent.date)) return;

  try {
    let result = await updateEventServer(eventId, {
      date: newStart.toDate(),
      endDate: newEnd.toDate(),
    });

    if (result.conflicts?.length) {
      const conflictNames = result.conflicts
        .map((conflict) => conflict.title)
        .join(", ");

      const confirmed = window.confirm(
        `This move overlaps with: ${conflictNames}.\n\nMove the event anyway?`
      );

      if (!confirmed) return;

      result = await updateEventServer(
        eventId,
        {
          date: newStart.toDate(),
          endDate: newEnd.toDate(),
        },
        true
      );
    }

    if (result.error) {
      window.alert(result.error);
      return;
    }

    if (result.success) {
      updateEventInStore({
        ...draggedEvent,
        date: newStart,
        endDate: newEnd,
      });
    }
  } catch {
    window.alert("Unable to reschedule the event. Please try again.");
  }
};

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-y-2 border",
        "transition-all hover:bg-violet-50",
      )}
      onClick={handleClick}
onDragOver={(e) => e.preventDefault()}
onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        {rowIndex === 0 && (
          <h4 className="text-xs text-gray-500">
            {day.format("ddd").toUpperCase()}
          </h4>
        )}
        <h4
          className={cn(
            "text-center text-sm",
            isToday &&
              "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white",
          )}
        >
          {isFirstDayOfMonth ? day.format("MMM D") : day.format("D")}
        </h4>
      </div>
      <EventRenderer date={day} view="month" events={events} />
    </div>
  );
}
