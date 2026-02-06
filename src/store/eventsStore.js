import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useEventsStore = create((set, get) => ({
  // Supabase is the ONLY source of truth - no localStorage, no cache
  events: [],
  loading: false,
  error: null,
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

  // Fetch all events from Supabase (public view)
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to include listerName for compatibility
      const eventsWithLister = (data || []).map(event => ({
        ...event,
        listerName: event.profiles?.name || 'Unknown',
        listerId: event.lister_id,
      }));

      set({ events: eventsWithLister, loading: false });
    } catch (error) {
      console.error('Error fetching events from Supabase:', error);
      set({ error: error.message, loading: false, events: [] });
    }
  },

  // Fetch events for a specific lister from Supabase
  fetchListerEvents: async (listerId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('lister_id', listerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const eventsWithLister = (data || []).map(event => ({
        ...event,
        listerName: event.profiles?.name || 'Unknown',
        listerId: event.lister_id,
      }));

      set({ events: eventsWithLister, loading: false });
    } catch (error) {
      console.error('Error fetching lister events from Supabase:', error);
      set({ error: error.message, loading: false, events: [] });
    }
  },

  // Get filtered events (client-side filtering)
  getFilteredEvents: () => {
    const { events, filters } = get();
    let filtered = [...events];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
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

  // Add event - INSERT into Supabase (caller must refetch)
  addEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // INSERT into Supabase - this is the source of truth
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          date: eventData.date,
          time: eventData.time,
          price: parseFloat(eventData.price),
          capacity: parseInt(eventData.capacity),
          category: eventData.category,
          images: eventData.images || [],
          lister_id: user.id, // Use auth.users.id
        })
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      if (error) throw error;

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error adding event to Supabase:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update event - UPDATE in Supabase (caller must refetch)
  updateEvent: async (eventId, updatedEvent) => {
    set({ loading: true, error: null });
    try {
      // Prepare update data (exclude fields that shouldn't be updated)
      const updateData = {
        ...(updatedEvent.title && { title: updatedEvent.title }),
        ...(updatedEvent.description && { description: updatedEvent.description }),
        ...(updatedEvent.location && { location: updatedEvent.location }),
        ...(updatedEvent.date && { date: updatedEvent.date }),
        ...(updatedEvent.time && { time: updatedEvent.time }),
        ...(updatedEvent.price !== undefined && { price: parseFloat(updatedEvent.price) }),
        ...(updatedEvent.capacity !== undefined && { capacity: parseInt(updatedEvent.capacity) }),
        ...(updatedEvent.category && { category: updatedEvent.category }),
        ...(updatedEvent.images && { images: updatedEvent.images }),
        ...(updatedEvent.status && { status: updatedEvent.status }),
      };

      // UPDATE in Supabase - this is the source of truth
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select(`
          *,
          profiles (
            name
          )
        `)
        .single();

      if (error) throw error;

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error updating event in Supabase:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Delete event - DELETE from Supabase (caller must refetch)
  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      // DELETE from Supabase - this is the source of truth
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error deleting event from Supabase:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Get event by ID - fetch from Supabase (not from cache)
  getEventById: async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event from Supabase:', error);
        return null;
      }

      // Transform to include listerName
      return {
        ...data,
        listerName: data.profiles?.name || 'Unknown',
        listerId: data.lister_id,
      };
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
  },
}));

export default useEventsStore;

