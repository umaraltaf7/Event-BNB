import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useBookingsStore from '../store/bookingsStore';
import useEventsStore from '../store/eventsStore';
import { showToast } from '../utils/toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BookingForm from '../components/bookings/BookingForm';

const UserDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const fetchBookingsByUserId = useBookingsStore((state) => state.fetchBookingsByUserId);
  const cancelBooking = useBookingsStore((state) => state.cancelBooking);
  const loading = useBookingsStore((state) => state.loading);
  const events = useEventsStore((state) => state.events);
  const fetchEvents = useEventsStore((state) => state.fetchEvents);
  const [bookings, setBookings] = useState([]);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null });
  const [bookingModal, setBookingModal] = useState({ isOpen: false, event: null });

  useEffect(() => {
    if (user?.id) {
      fetchBookingsByUserId(user.id).then(setBookings);
      fetchEvents();
    }
  }, [user, fetchBookingsByUserId, fetchEvents]);

  const activeBookings = bookings.filter(
    (booking) => booking.status !== 'cancelled'
  );

  const availableEvents = events.filter(event => event.status !== 'booked');

  const handleCancelBooking = (booking) => {
    setCancelModal({ isOpen: true, booking });
  };

  const confirmCancel = async () => {
    if (cancelModal.booking) {
      const result = await cancelBooking(cancelModal.booking.id);
      if (result.success) {
        showToast('Booking cancelled successfully', 'success');
        setCancelModal({ isOpen: false, booking: null });
        // Refresh bookings
        if (user?.id) {
          const updatedBookings = await fetchBookingsByUserId(user.id);
          setBookings(updatedBookings);
        }
      } else {
        showToast(result.error || 'Failed to cancel booking', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const openBookingModal = (event) => {
    setBookingModal({ isOpen: true, event });
  };

  const closeBookingModal = () => {
    setBookingModal({ isOpen: false, event: null });
  };

  const handleBookingSuccess = () => {
    // Refresh bookings after successful booking
    if (user?.id) {
      fetchBookingsByUserId(user.id).then(setBookings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.name || user?.email}!</p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-900">{profile?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <p className="text-gray-900 capitalize">{profile?.role || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Available Events for Booking */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Events</h2>
          {availableEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg">No available events to book.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={event.images?.[0] || 'https://via.placeholder.com/400x200?text=Event'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-rose-600">
                      ${event.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">{event.location}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs">
                        {event.category}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openBookingModal(event)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bookings Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : activeBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">You haven't booked any events yet.</p>
              <Link to="/">
                <Button>Explore Events</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={booking.eventImage}
                      alt={booking.eventTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-rose-600">
                      ${booking.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {booking.event?.title || booking.eventTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">Date: {formatDate(booking.booking_date || booking.date)}</p>
                    <p className="text-gray-600 text-sm mb-1">Time: {formatTime(booking.booking_time || booking.time)}</p>
                    {booking.phone_number && (
                      <p className="text-gray-600 text-sm mb-2">Phone: {booking.phone_number}</p>
                    )}
                    
                    {booking.status === 'rejected' && booking.lister_message && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Message from lister:</strong> {booking.lister_message}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
                        disabled={booking.status !== 'pending'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingForm
        eventId={bookingModal.event?.id}
        eventTitle={bookingModal.event?.title}
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        onSuccess={handleBookingSuccess}
      />

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, booking: null })}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel your booking for{' '}
            <strong>{cancelModal.booking?.eventTitle}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setCancelModal({ isOpen: false, booking: null })}
            >
              No, Keep It
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboard;

