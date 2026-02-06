import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useEventsStore from '../store/eventsStore';
import useBookingsStore from '../store/bookingsStore';
import { showToast } from '../utils/toast';
import { eventCategories, locations } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BookingApproval from '../components/bookings/BookingApproval';
import { supabase } from '../lib/supabase';

const ListerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const events = useEventsStore((state) => state.events);
  const loading = useEventsStore((state) => state.loading);
  const fetchListerEvents = useEventsStore((state) => state.fetchListerEvents);
  const addEvent = useEventsStore((state) => state.addEvent);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const deleteEvent = useEventsStore((state) => state.deleteEvent);

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventBookings, setEventBookings] = useState({});
  const [listerBookings, setListerBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const bookingsStore = useBookingsStore();

  // Fetch lister bookings
  const fetchListerBookings = async () => {
    if (!user?.id) return;
    const data = await bookingsStore.fetchBookingsForLister(user.id);
    setListerBookings(data);
  };

  useEffect(() => {
    if (user?.id) {
      fetchListerEvents(user.id);
      fetchListerBookings();
    }
  }, [user?.id, fetchListerEvents]);

  // View bookings for a single event
  const handleViewBookings = async (event) => {
    setSelectedEvent(event);
    const data = await bookingsStore.fetchBookingsByEventId(event.id);
    setEventBookings({ [event.id]: data || [] });
  };

  const handleViewAllBookings = () => setShowAllBookings(true);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lister Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your events, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleViewAllBookings}>
              View All Bookings ({listerBookings.filter((b) => b.status === 'pending').length} pending)
            </Button>
            <Button onClick={() => setShowEventModal(true)}>+ Create Event</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">No events yet.</p>
                <Button onClick={() => setShowEventModal(true)}>Create Your First Event</Button>
              </Card>
            ) : (
              events.map((event) => {
                const bookings = (eventBookings[event.id] || []).filter(b => b.status !== 'cancelled');
                const eventIsOwned = user?.id === event.lister_id;
                return (
                  <Card key={event.id} className="p-6 border-2 border-rose-200">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 overflow-hidden rounded-lg flex-shrink-0">
                        <img src={event.images?.[0] || 'https://via.placeholder.com/128'} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{event.title}</h3>
                            <p className="text-gray-600">{event.location}</p>
                            <p className="text-gray-500 text-sm">{formatDate(event.date)} at {event.time}</p>
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {eventIsOwned ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleViewBookings(event)}>View Bookings</Button>
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="danger">Delete</Button>
                              </>
                            ) : <div className="text-sm text-gray-500 italic">View only</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => { setSelectedEvent(null); setEventBookings({}); }} title={`Bookings for ${selectedEvent?.title}`} size="lg">
        {selectedEvent && (
          <div className="space-y-4">
            {(!eventBookings[selectedEvent.id] || eventBookings[selectedEvent.id].length === 0) ? (
              <p className="text-center py-8 text-gray-500">No bookings yet.</p>
            ) : eventBookings[selectedEvent.id]
              .filter((b) => b.status !== 'cancelled')
              .map((booking) => <BookingApproval key={booking.id} booking={booking} />)
            }
          </div>
        )}
      </Modal>

      {/* All Bookings Modal */}
      <Modal isOpen={showAllBookings} onClose={() => setShowAllBookings(false)} title="All Bookings" size="xl">
        <div className="space-y-4">
          {listerBookings.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No bookings yet.</p>
          ) : listerBookings.filter(b => b.status !== 'cancelled').map((booking) => (
            <BookingApproval key={booking.id} booking={booking} />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ListerDashboard;
