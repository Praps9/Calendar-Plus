export const EVENT_CATEGORIES = [
  "Study",
  "Work",
  "Personal",
  "Meeting",
  "Deadline",
  "Other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const DEFAULT_EVENT_CATEGORY: EventCategory = "Other";

export const EVENT_CATEGORY_STYLES: Record<
  EventCategory,
  { label: string; color: string; backgroundColor: string }
> = {
  Study: {
    label: "Study",
    color: "#1D4ED8",
    backgroundColor: "#DBEAFE",
  },
  Work: {
    label: "Work",
    color: "#047857",
    backgroundColor: "#D1FAE5",
  },
  Personal: {
    label: "Personal",
    color: "#7E22CE",
    backgroundColor: "#F3E8FF",
  },
  Meeting: {
    label: "Meeting",
    color: "#C2410C",
    backgroundColor: "#FFEDD5",
  },
  Deadline: {
    label: "Deadline",
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
  },
  Other: {
    label: "Other",
    color: "#475569",
    backgroundColor: "#E2E8F0",
  },
};

export function isEventCategory(value: unknown): value is EventCategory {
  return (
    typeof value === "string" &&
    EVENT_CATEGORIES.some((category) => category === value)
  );
}