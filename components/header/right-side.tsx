
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEventStore, useViewStore } from "@/lib/store";
import { EVENT_CATEGORIES } from "@/lib/event-categories";
import { Input } from "@/components/ui/input";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderRight() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setView } = useViewStore();

  const {
    eventSearchQuery,
    setEventSearchQuery,
    categoryFilter,
    setCategoryFilter,
  } = useEventStore();

  const displayName = session?.user?.name || session?.user?.email || "Account";
  const avatarFallback = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut({
      redirect: false,
    });

    router.replace("/login");
    router.refresh();
  }

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

      <Select
        defaultValue="month"
        onValueChange={(value) => setView(value)}
      >
        <SelectTrigger
          aria-label="Calendar view"
          className="w-24 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0"
        >
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="day">Day</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
          >
            <Avatar>
              <AvatarImage src="/img/inst2.png" alt={displayName} />
              <AvatarFallback>{avatarFallback || "CN"}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{displayName}</span>
              {session?.user?.email && (
                <span className="text-xs text-muted-foreground">
                  {session.user.email}
                </span>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void handleSignOut();
            }}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
