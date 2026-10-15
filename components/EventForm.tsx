
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { useEventStore } from "@/lib/store";

import { createEvent, updateEvent } from "@/app/actions/event-actions";

export default function EventForm() {
  const { closeEventForm, selectedEvent, isEventFormOpen } = useEventStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [time, setTime] = useState(dayjs().format("HH:mm"));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setDate(dayjs(selectedEvent.date).format("YYYY-MM-DD"));
      setTime(dayjs(selectedEvent.date).format("HH:mm"));
      setDescription(selectedEvent.description || "");
    }
  }, [selectedEvent]);

  if (!isEventFormOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      let res;
  
      if (selectedEvent) {
        // ✅ UPDATE event
        res = await updateEvent(Number(selectedEvent.id), {
          title,
          description,
          date: new Date(`${date}T${time}:00`),
        });
      } else {
        // ✅ CREATE new event
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("date", date);
        formData.append("time", time);
      
        res = await createEvent(formData);
      }
  
      if (res.error) {
        setError(res.error);
      } else {
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
        className="bg-white p-6 rounded-2xl shadow-2xl w-[380px]"
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

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">✅ Saved!</p>}

        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="outline" onClick={closeEventForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
}
