import dayjs, { Dayjs } from "dayjs";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { getMonth } from "./getTime";
import { deleteEvent as deleteEventServer } from "../app/actions/event-actions"; // ✅ connect to backend delete

// ------------------------------
// 🧭 Interfaces
// ------------------------------

interface ViewStoreType {
  selectedView: string;
  setView: (value: string) => void;
}

interface DateStoreType {
  userSelectedDate: Dayjs;
  setDate: (value: Dayjs) => void;
  twoDMonthArray: dayjs.Dayjs[][];
  selectedMonthIndex: number;
  setMonth: (index: number) => void;
}

export type CalendarEventType = {
  id: number; // ✅ Use number (since DB id is numeric)
  title: string;
  date: dayjs.Dayjs;
  description: string;
  location?: string;
};

type EventStore = {
  events: CalendarEventType[];
  selectedEvent: CalendarEventType | null;
  isEventSummaryOpen: boolean;
  isEventFormOpen: boolean;

  setEvents: (events: CalendarEventType[]) => void;

  openEventSummary: (event: CalendarEventType) => void;
  closeEventSummary: () => void;

  openEventForm: (event?: CalendarEventType) => void;
  closeEventForm: () => void;

  addEvent: (event: CalendarEventType) => void;
  deleteEvent: (id: number) => Promise<void>;
  updateEvent: (updatedEvent: CalendarEventType) => void;
};

interface ToggleSideBarType {
  isSideBarOpen: boolean;
  setSideBarOpen: () => void;
}

// ------------------------------
// 🗓️ View Store
// ------------------------------

export const useViewStore = create<ViewStoreType>()(
  devtools(
    persist(
      (set) => ({
        selectedView: "month",
        setView: (value: string) => set({ selectedView: value }),
      }),
      { name: "calendar_view", skipHydration: true },
    ),
  ),
);

// ------------------------------
// 📆 Date Store
// ------------------------------

export const useDateStore = create<DateStoreType>()(
  devtools(
    persist(
      (set) => ({
        userSelectedDate: dayjs(),
        twoDMonthArray: getMonth(),
        selectedMonthIndex: dayjs().month(),
        setDate: (value: Dayjs) => set({ userSelectedDate: value }),
        setMonth: (index) =>
          set({ twoDMonthArray: getMonth(index), selectedMonthIndex: index }),
      }),
      { name: "date_data", skipHydration: true },
    ),
  ),
);

// ------------------------------
// 📍 Event Store
// ------------------------------

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  selectedEvent: null,
  isEventSummaryOpen: false,
  isEventFormOpen: false,

  setEvents: (events) => set({ events }),

  openEventSummary: (event) =>
    set({ selectedEvent: event, isEventSummaryOpen: true }),
  closeEventSummary: () =>
    set({ selectedEvent: null, isEventSummaryOpen: false }),

  openEventForm: (event) =>
    set({
      selectedEvent: event || null,
      isEventFormOpen: true,
      isEventSummaryOpen: false,
    }),
  closeEventForm: () => set({ isEventFormOpen: false }),

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  // ✅ Fixed Delete Function (removes from DB + UI)
  deleteEvent: async (id) => {
    try {
      await deleteEventServer(id); // Delete from DB
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
      console.log(`✅ Event with ID ${id} deleted from DB`);
    } catch (error) {
      console.error("❌ Failed to delete event:", error);
    }
  },

  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === updatedEvent.id ? updatedEvent : e,
      ),
    })),
}));

// ------------------------------
// 🧭 Sidebar Store
// ------------------------------

export const useToggleSideBarStore = create<ToggleSideBarType>()(
  (set, get) => ({
    isSideBarOpen: true,
    setSideBarOpen: () => set({ isSideBarOpen: !get().isSideBarOpen }),
  }),
);
