import { create } from 'zustand';

const useBookingsStore = create((set, get) => ({
  bookings: [],
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, { ...booking, id: Date.now().toString(), status: 'confirmed' }]
  })),
  cancelBooking: (bookingId) => set((state) => ({
    bookings: state.bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
    )
  })),
  getBookingsByUserId: (userId) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.userId === userId);
  },
  getBookingsByEventId: (eventId) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.eventId === eventId);
  },
  hasBooking: (userId, eventId, date) => {
    const { bookings } = get();
    return bookings.some(
      (booking) =>
        booking.userId === userId &&
        booking.eventId === eventId &&
        booking.date === date &&
        booking.status !== 'cancelled'
    );
  },
}));

export default useBookingsStore;

