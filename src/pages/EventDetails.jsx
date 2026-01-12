import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import useEventsStore from '../store/eventsStore';
import useAuthStore from '../store/authStore';
import useBookingsStore from '../store/bookingsStore';
import { showToast } from '../utils/toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getEventById = useEventsStore((state) => state.getEventById);
  const { addBooking, hasBooking } = useBookingsStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const event = getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleBookEvent = () => {
    if (!isAuthenticated) {
      showToast('Please login to book events', 'error');
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      showToast('Only users can book events', 'error');
      return;
    }

    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (hasBooking(user.id, event.id, bookingDate.startDate.toISOString().split('T')[0])) {
      showToast('You have already booked this event for this date', 'error');
      return;
    }

    addBooking({
      userId: user.id,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.images[0],
      date: bookingDate.startDate.toISOString().split('T')[0],
      price: event.price,
      status: 'confirmed',
    });

    showToast('Event booked successfully!', 'success');
    setShowBookingModal(false);
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative h-96 rounded-xl overflow-hidden mb-4">
              <img
                src={event.images[selectedImage]}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {event.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-rose-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${event.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Event Details */}
          <div>
            <Card className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <p className="text-gray-600 mb-4">{event.location}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {event.category}
                </span>
                <span className="text-gray-500">Capacity: {event.capacity}</span>
              </div>

              <div className="border-t border-b border-gray-200 py-6 my-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Date & Time</h3>
                    <p className="text-lg text-gray-900">{formatDate(event.date)}</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Location</h3>
                    <p className="text-lg text-gray-900">{event.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Price</h3>
                    <p className="text-3xl font-bold text-rose-600">${event.price}</p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBookEvent}
                className="w-full"
                size="lg"
                disabled={!isAuthenticated || user?.role !== 'user'}
              >
                {!isAuthenticated
                  ? 'Login to Book'
                  : user?.role !== 'user'
                  ? 'Only Users Can Book'
                  : 'Book Event'}
              </Button>
            </Card>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About this event</h2>
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hosted by</h3>
            <p className="text-gray-600">{event.listerName}</p>
          </div>
        </Card>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Booking"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600">{event.location}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <DateRange
              ranges={[bookingDate]}
              onChange={(ranges) => setBookingDate(ranges.selection)}
              minDate={new Date()}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">${event.price}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmBooking}>Confirm Booking</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;

