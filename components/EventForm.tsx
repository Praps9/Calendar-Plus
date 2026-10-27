
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { useEventStore } from "@/lib/store";
import { createEvent, updateEvent } from "@/app/actions/event-actions";
import {
  EVENT_CATEGORIES,
  DEFAULT_EVENT_CATEGORY,
  isEventCategory,
  type EventCategory,
} from "@/lib/event-categories";

export default function EventForm() {
  const { closeEventForm, selectedEvent, isEventFormOpen } = useEventStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [time, setTime] = useState(dayjs().format("HH:mm"));
const [endTime, setEndTime] = useState(
  dayjs().add(1, "hour").format("HH:mm")
);
const [conflicts, setConflicts] = useState<
  { id: number; title: string; date: string; endDate: string }[]
>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<EventCategory>(DEFAULT_EVENT_CATEGORY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setError(null);
    setSuccess(false);
setConflicts([]);

    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setDate(dayjs(selectedEvent.date).format("YYYY-MM-DD"));
      setTime(dayjs(selectedEvent.date).format("HH:mm"));
setEndTime(dayjs(selectedEvent.endDate).format("HH:mm"));
      setDescription(selectedEvent.description || "");
      setCategory(
        isEventCategory(selectedEvent.category)
          ? selectedEvent.category
          : DEFAULT_EVENT_CATEGORY
      );
    } else {
      setTitle("");
      setDate(dayjs().format("YYYY-MM-DD"));
      setTime(dayjs().format("HH:mm"));
setEndTime(dayjs().add(1, "hour").format("HH:mm"));
      setDescription("");
      setCategory(DEFAULT_EVENT_CATEGORY);
    }
  }, [selectedEvent, isEventFormOpen]);

  if (!isEventFormOpen) return null;

  
const handleSubmit = async (
  e?: React.FormEvent,
  confirmConflicts = false
) => {
  e?.preventDefault();
  setLoading(true);
  setError(null);

  try {
    if (endTime <= time) {
      setError("End time must be later than start time");
      return;
    }

    let res;

    if (selectedEvent) {
      res = await updateEvent(
        Number(selectedEvent.id),
        {
          title,
          description,
          date: new Date(`${date}T${time}:00`),
          endDate: new Date(`${date}T${endTime}:00`),
          category,
        },
        confirmConflicts
      );
    } else {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("endTime", endTime);
      formData.append("category", category);

      res = await createEvent(formData, confirmConflicts);
    }

    if (res.conflicts && res.conflicts.length > 0) {
      setConflicts(res.conflicts);
      return;
    }

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setConflicts([]);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeEventForm();
      }, 800);
    }
  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-2xl w-[380px] max-w-[calc(100vw-2rem)]"
      >
        <h2 className="text-lg font-semibold mb-4">
          {selectedEvent ? "Edit Event" : "Add New Event"}
        </h2>

        <div className="space-y-3">
          <Input
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
<div className="space-y-1">
  <label
    htmlFor="event-end-time"
    className="text-sm font-medium text-gray-700"
  >
    End Time
  </label>
  <Input
    id="event-end-time"
    type="time"
    value={endTime}
    onChange={(e) => setEndTime(e.target.value)}
    required
  />
</div>

          <div className="space-y-1">
            <label
              htmlFor="event-category"
              className="text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="event-category"
              value={category}
              onChange={(e) => {
                if (isEventCategory(e.target.value)) {
                  setCategory(e.target.value);
                }
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {EVENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

{conflicts.length > 0 && (
  <div className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3">
    <p className="font-semibold text-amber-900">
      This event overlaps with existing event(s):
    </p>

    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
      {conflicts.map((conflict) => (
        <li key={conflict.id}>
          <span className="font-medium">{conflict.title}</span>
          {" — "}
          {dayjs(conflict.date).format("MMM D, h:mm A")}
          {"–"}
          {dayjs(conflict.endDate).format("h:mm A")}
        </li>
      ))}
    </ul>

    <p className="mt-2 text-sm text-amber-900">
      Would you like to save this event anyway?
    </p>

    <div className="mt-3 flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setConflicts([])}
        disabled={loading}
      >
        Cancel
      </Button>

      <Button
        type="button"
        disabled={loading}
        onClick={() => handleSubmit(undefined, true)}
      >
        {loading ? "Saving..." : "Save anyway"}
      </Button>
    </div>
  </div>
)}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">✓ Saved!</p>}

        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="outline" onClick={closeEventForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : selectedEvent ? "Save Changes" : "Add Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
