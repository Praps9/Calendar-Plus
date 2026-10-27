
"use client";

import React, { useRef, useEffect } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { IoCloseSharp } from "react-icons/io5";
import {
  type CalendarEventType,
  useEventStore,
} from "@/lib/store";
import {
  DEFAULT_EVENT_CATEGORY,
  EVENT_CATEGORY_STYLES,
  isEventCategory,
} from "@/lib/event-categories";

interface EventSummaryPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEventType;
}

export default function EventSummaryPopover({
  isOpen,
  onClose,
  event,
}: EventSummaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { deleteEvent, openEventForm } = useEventStore();

  const category = isEventCategory(event.category)
    ? event.category
    : DEFAULT_EVENT_CATEGORY;
  const categoryStyle = EVENT_CATEGORY_STYLES[category];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = () => {
    void deleteEvent(event.id);
    onClose();
  };

  const handleEdit = () => {
    openEventForm(event);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={popoverRef}
        className="relative w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Event Summary
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IoCloseSharp className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Title:</strong> {event.title}
          </p>

          <div>
            <strong>Category:</strong>{" "}
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                color: categoryStyle.color,
                backgroundColor: categoryStyle.backgroundColor,
                border: `1px solid ${categoryStyle.color}40`,
              }}
            >
              {categoryStyle.label}
            </span>
          </div>

          <p>
            <strong>Date:</strong>{" "}
            {dayjs(event.date).format("dddd, MMMM D, YYYY h:mm A")}
          </p>

          {event.location && (
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          )}

          {event.description && (
            <p className="whitespace-pre-wrap break-words">
              <strong>Details:</strong> {event.description}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
