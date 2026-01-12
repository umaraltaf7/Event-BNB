import { create } from 'zustand';
import { mockEvents } from '../data/mockData';

const useEventsStore = create((set, get) => ({
  events: mockEvents,
  filters: {
    location: '',
    category: '',
    priceRange: [0, 1000],
    dateRange: null,
    searchQuery: '',
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  resetFilters: () => set({
    filters: {
      location: '',
      category: '',
      priceRange: [0, 1000],
      dateRange: null,
      searchQuery: '',
    }
  }),
  getFilteredEvents: () => {
    const { events, filters } = get();
    let filtered = [...events];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    if (filters.location) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((event) => event.category === filters.category);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (event) =>
          event.price >= filters.priceRange[0] && event.price <= filters.priceRange[1]
      );
    }

    if (filters.dateRange?.startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= filters.dateRange.startDate && eventDate <= filters.dateRange.endDate;
      });
    }

    return filtered;
  },
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Date.now().toString() }]
  })),
  updateEvent: (eventId, updatedEvent) => set((state) => ({
    events: state.events.map((event) =>
      event.id === eventId ? { ...event, ...updatedEvent } : event
    )
  })),
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter((event) => event.id !== eventId)
  })),
  getEventById: (eventId) => {
    const { events } = get();
    return events.find((event) => event.id === eventId);
  },
}));

export default useEventsStore;

