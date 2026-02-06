import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

const useBookingsStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  // Fetch bookings by user ID
  fetchBookingsByUserId: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event:events(title, images, location)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ bookings: data || [], loading: false });
      return data;
    } catch (error) {
      console.error('Error fetching bookings by user:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Fetch bookings by event ID
  fetchBookingsByEventId: async (eventId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:auth.users(email, phone_number, id_card_number),
          event:events(title, location)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings by event:', error);
      return [];
    }
  },

  // Add booking
  addBooking: async (bookingData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          event_id: bookingData.eventId,
          phone_number: bookingData.phoneNumber,
          id_card_number: bookingData.idCardNumber,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          note: bookingData.note || null,
          status: 'pending'
        })
        .select(`
          *,
          event:events(title, images, location)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'This time slot is already booked for this event' };
        }
        throw error;
      }

      set((state) => ({ bookings: [data, ...state.bookings] }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding booking:', error);
      return { success: false, error: error.message };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status, listerMessage = null) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, lister_message: listerMessage })
        .eq('id', bookingId)
        .select(`
          *,
          event:events(title, images, location)
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => (b.id === bookingId ? data : b))
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select(`
          *,
          event:events(title, images, location)
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        bookings: state.bookings.map(b => (b.id === bookingId ? data : b))
      }));
      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has booking
  hasBooking: async (userId, eventId, date, time) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .eq('booking_date', date)
        .eq('booking_time', time)
        .neq('status', 'cancelled')
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  },

  // Fetch bookings for lister
  fetchBookingsForLister: async (listerId) => {
    set({ loading: true, error: null });
    try {
      // Get events owned by lister
      const { data: ownedEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('lister_id', listerId);
      if (eventsError) throw eventsError;

      const eventIds = ownedEvents.map(e => e.id);
      if (eventIds.length === 0) {
        set({ bookings: [], loading: false });
        return [];
      }

      // Fetch bookings for these events
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:auth.users(email, phone_number, id_card_number),
          event:events(title, location, date, time)
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ bookings: data || [], loading: false });
      return data;
    } catch (err) {
      console.error('Error fetching lister bookings:', err);
      set({ error: err.message, loading: false });
      return [];
    }
  },
}));

export default useBookingsStore;
