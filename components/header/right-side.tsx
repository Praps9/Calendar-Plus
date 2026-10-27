
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEventStore, useViewStore } from "@/lib/store";
import { EVENT_CATEGORIES } from "@/lib/event-categories";
import { Input } from "@/components/ui/input";

export default function HeaderRight() {
  const { setView } = useViewStore();
  const {
    eventSearchQuery,
    setEventSearchQuery,
    categoryFilter,
    setCategoryFilter,
  } = useEventStore();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Input
        type="search"
        placeholder="Search events..."
        aria-label="Search events"
        value={eventSearchQuery}
        onChange={(e) => setEventSearchQuery(e.target.value)}
        className="w-36 sm:w-44"
      />

      <Select
        value={categoryFilter}
        onValueChange={(value) =>
          setCategoryFilter(value as typeof categoryFilter)
        }
      >
        <SelectTrigger
          aria-label="Filter events by category"
          className="w-32"
        >
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All categories</SelectItem>
          {EVENT_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => setView(value)}>
        <SelectTrigger className="w-24 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="day">Day</SelectItem>
        </SelectContent>
      </Select>

      <Avatar>
        <AvatarImage src="/img/inst2.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}
