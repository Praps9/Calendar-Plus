
import { updateEvent as updateEventServer } from "@/app/actions/event-actions";
import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getHours, isCurrentDay } from "@/lib/getTime";
import { EventRenderer } from "./event-renderer";

export default function DayView() {
  const [currentTime, setCurrentTime] = useState(dayjs());

  const {
    openEventForm,
    events,
    updateEvent: updateEventInStore,
  } = useEventStore();

  const { userSelectedDate, setDate } = useDateStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleEventDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetDate: dayjs.Dayjs,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const eventId = Number(
      e.dataTransfer.getData("application/calendar-event-id"),
    );

    const draggedEvent = events.find((event) => event.id === eventId);

    if (!draggedEvent) return;

    const newStart = targetDate
      .minute(0)
      .second(0)
      .millisecond(0);

    const duration = draggedEvent.endDate.diff(draggedEvent.date);
    const newEnd = newStart.add(duration, "millisecond");

    if (newStart.isSame(draggedEvent.date)) return;

    const updatedData = {
      date: newStart.toDate(),
      endDate: newEnd.toDate(),
    };

    try {
      let result = await updateEventServer(eventId, updatedData);

      if (result.conflicts?.length) {
        const names = result.conflicts
          .map((conflict) => conflict.title)
          .join(", ");

        const confirmed = window.confirm(
          `This move overlaps with: ${names}.\n\nMove the event anyway?`,
        );

        if (!confirmed) return;

        result = await updateEventServer(eventId, updatedData, true);
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

  const isToday =
    userSelectedDate.format("DD-MM-YY") === dayjs().format("DD-MM-YY");

  return (
    <>
      <div className="grid grid-cols-[auto_auto_1fr] px-4">
        <div className="w-16 border-r border-gray-300 text-xs">
          GMT +2
        </div>

        <div className="flex w-16 flex-col items-center">
          <div className={cn("text-xs", isToday && "text-blue-600")}>
            {userSelectedDate.format("ddd")}
          </div>

          <div
            className={cn(
              "h-12 w-12 rounded-full p-2 text-2xl",
              isToday && "bg-blue-600 text-white",
            )}
          >
            {userSelectedDate.format("DD")}
          </div>
        </div>

        <div />
      </div>

      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-[auto_1fr] p-4">
          {/* Time Column */}
          <div className="w-16 border-r border-gray-300">
            {getHours.map((hour, index) => (
              <div key={index} className="relative h-16">
                <div className="absolute -top-2 text-xs text-gray-600">
                  {hour.format("HH:mm")}
                </div>
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="relative border-r border-gray-300">
            {getHours.map((hour, i) => {
              const slotDate = userSelectedDate.hour(hour.hour());

              return (
                <div
                  key={i}
                  className="relative flex h-16 cursor-pointer flex-col items-center gap-y-2 border-b border-gray-300 hover:bg-gray-100"
                  onClick={() => {
                    setDate(slotDate);
                    openEventForm();
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleEventDrop(e, slotDate)}
                >
                  <EventRenderer
                    events={events}
                    date={slotDate}
                    view="day"
                  />
                </div>
              );
            })}

            {/* Current time indicator */}
            {isCurrentDay(userSelectedDate) && (
              <div
                className="absolute h-0.5 w-full bg-red-500"
                style={{
                  top: `${(currentTime.hour() / 24) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
