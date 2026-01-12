import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useBookingsStore from '../store/bookingsStore';
import { showToast } from '../utils/toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const UserDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { getBookingsByUserId, cancelBooking } = useBookingsStore();
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null });

  const bookings = getBookingsByUserId(user?.id || '').filter(
    (booking) => booking.status !== 'cancelled'
  );

  const handleCancelBooking = (booking) => {
    setCancelModal({ isOpen: true, booking });
  };

  const confirmCancel = () => {
    if (cancelModal.booking) {
      cancelBooking(cancelModal.booking.id);
      showToast('Booking cancelled successfully', 'success');
      setCancelModal({ isOpen: false, booking: null });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Profile Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </Card>

        {/* Bookings Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">You haven't booked any events yet.</p>
              <Link to="/">
                <Button>Explore Events</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
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
                      {booking.eventTitle}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">Date: {formatDate(booking.date)}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
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

