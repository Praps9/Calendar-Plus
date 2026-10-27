
import { updateEvent as updateEventServer } from "@/app/actions/event-actions";
import { getHours, getWeekDays } from "@/lib/getTime";
import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { EventRenderer } from "./event-renderer";

export default function WeekView() {
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

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2">
        <div className="w-16 border-r border-gray-300">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs text-gray-600">
              GMT +2
            </div>
          </div>
        </div>

        {getWeekDays(userSelectedDate).map(
          ({ currentDate, today }, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={cn("text-xs", today && "text-blue-600")}>
                {currentDate.format("ddd")}
              </div>

              <div
                className={cn(
                  "h-12 w-12 rounded-full p-2 text-2xl",
                  today && "bg-blue-600 text-white",
                )}
              >
                {currentDate.format("DD")}
              </div>
            </div>
          ),
        )}
      </div>

      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2">
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

          {/* Week Columns */}
          {getWeekDays(userSelectedDate).map(
            ({ isCurrentDay, today }, index) => {
              const dayDate = userSelectedDate
                .startOf("week")
                .add(index, "day");

              return (
                <div key={index} className="relative border-r border-gray-300">
                  {getHours.map((hour, i) => {
                    const slotDate = dayDate.hour(hour.hour());

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
                          view="week"
                        />
                      </div>
                    );
                  })}

                  {isCurrentDay(dayDate) && today && (
                    <div
                      className="absolute h-0.5 w-full bg-red-500"
                      style={{
                        top: `${(currentTime.hour() / 24) * 100}%`,
                      }}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      </ScrollArea>
    </>
  );
}
