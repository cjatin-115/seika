import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PatientProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
}

interface AppStore {
  // Profile management
  activeProfileId: string | null;
  setActiveProfileId: (id: string) => void;

  // UI state
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Notifications
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;

  // Booking state
  selectedDoctor: any | null;
  setSelectedDoctor: (doctor: any) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  selectedSlot: string | null;
  setSelectedSlot: (slot: string) => void;

  // Cache
  lastRefresh: Record<string, number>;
  setLastRefresh: (key: string, time: number) => void;

  // Clear all
  reset: () => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeProfileId: null,
      setActiveProfileId: (id: string) => set({ activeProfileId: id }),

      isMobileMenuOpen: false,
      setIsMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),

      unreadNotificationCount: 0,
      setUnreadNotificationCount: (count: number) => set({ unreadNotificationCount: count }),

      selectedDoctor: null,
      setSelectedDoctor: (doctor: any) => set({ selectedDoctor: doctor }),

      selectedDate: null,
      setSelectedDate: (date: Date) => set({ selectedDate: date }),

      selectedSlot: null,
      setSelectedSlot: (slot: string) => set({ selectedSlot: slot }),

      lastRefresh: {},
      setLastRefresh: (key: string, time: number) =>
        set((state) => ({
          lastRefresh: { ...state.lastRefresh, [key]: time },
        })),

      reset: () =>
        set({
          activeProfileId: null,
          isMobileMenuOpen: false,
          unreadNotificationCount: 0,
          selectedDoctor: null,
          selectedDate: null,
          selectedSlot: null,
          lastRefresh: {},
        }),
    }),
    {
      name: 'medibook-store',
      version: 1,
    }
  )
);

export default useAppStore;
