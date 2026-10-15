// import { CalendarEventType, useEventStore } from "@/lib/store";

// import dayjs from "dayjs";
// import React from "react";

// type EventRendererProps = {
//   date: dayjs.Dayjs;
//   view: "month" | "week" | "day";
//   events: CalendarEventType[];
// };

// export function EventRenderer({ date, view, events }: EventRendererProps) {
//   const { openEventSummary } = useEventStore();

//   const filteredEvents = events.filter((event: CalendarEventType) => {
//     if (view === "month") {
//       return event.date.format("DD-MM-YY") === date.format("DD-MM-YY");
//     } else if (view === "week" || view === "day") {
//       return event.date.format("DD-MM-YY HH") === date.format("DD-MM-YY HH");
//     }
//   });

//   return (
//     <>
//       {filteredEvents.map((event) => (
//         <div
//           key={event.id}
//           onClick={(e) => {
//             e.stopPropagation();
//             openEventSummary(event);
//           }}
//           className="line-clamp-1 w-[90%] cursor-pointer rounded-sm bg-green-700 p-1 text-sm text-white"
//         >
//           {event.title}
//         </div>
//       ))}
//     </>
//   );
// }


import { CalendarEventType } from "@/lib/store";
import dayjs from "dayjs";
import React, { useState } from "react";
import  EventSummaryPopover  from "./event-summary-popover";

type EventRendererProps = {
  date: dayjs.Dayjs;
  view: "month" | "week" | "day";
  events: CalendarEventType[];
};

export function EventRenderer({ date, view, events }: EventRendererProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const filteredEvents = events.filter((event: CalendarEventType) => {
    if (view === "month") {
      return event.date.format("DD-MM-YY") === date.format("DD-MM-YY");
    } else if (view === "week" || view === "day") {
      return event.date.format("DD-MM-YY HH") === date.format("DD-MM-YY HH");
    }
  });

  return (
    <>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEvent(event);
            setIsPopoverOpen(true);
          }}
          className="line-clamp-1 w-[90%] cursor-pointer rounded-sm bg-green-700 p-1 text-sm text-white"
        >
          {event.title}
        </div>
      ))}

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

