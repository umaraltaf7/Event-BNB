import { useState } from 'react';
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

const ListerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { events, addEvent, updateEvent, deleteEvent } = useEventsStore();
  const { getBookingsByEventId } = useBookingsStore();
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  const userEvents = events.filter((event) => event.listerId === user?.id);

  const openCreateModal = () => {
    setEditingEvent(null);
    reset();
    setShowEventModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setValue('title', event.title);
    setValue('description', event.description);
    setValue('location', event.location);
    setValue('date', event.date);
    setValue('time', event.time);
    setValue('price', event.price);
    setValue('capacity', event.capacity);
    setValue('category', event.category);
    setShowEventModal(true);
  };

  const onSubmit = (data) => {
    const eventData = {
      ...data,
      price: parseFloat(data.price),
      capacity: parseInt(data.capacity),
      images: editingEvent?.images || [
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      ],
      listerId: user.id,
      listerName: user.name,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      showToast('Event updated successfully!', 'success');
    } else {
      addEvent(eventData);
      showToast('Event created successfully!', 'success');
    }

    setShowEventModal(false);
    reset();
  };

  const handleDelete = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
      showToast('Event deleted successfully', 'success');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lister Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your events, {user?.name}</p>
          </div>
          <Button onClick={openCreateModal}>+ Create Event</Button>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {userEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">You haven't created any events yet.</p>
              <Button onClick={openCreateModal}>Create Your First Event</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {userEvents.map((event) => {
                const bookings = getBookingsByEventId(event.id).filter(
                  (b) => b.status !== 'cancelled'
                );
                return (
                  <Card key={event.id} className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={event.images[0]}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 mb-2">{event.location}</p>
                            <p className="text-gray-500 text-sm mb-2">
                              {formatDate(event.date)} at {event.time}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">Price: ${event.price}</span>
                              <span className="text-gray-600">Capacity: {event.capacity}</span>
                              <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs">
                                {event.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                              }}
                            >
                              View Bookings
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(event)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          reset();
        }}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Event Title"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              rows="4"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                {...register('location', { required: 'Location is required' })}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select category</option>
                {eventCategories
                  .filter((cat) => cat !== 'All')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              {...register('date', { required: 'Date is required' })}
              error={errors.date?.message}
            />
            <Input
              label="Time"
              type="time"
              {...register('time', { required: 'Time is required' })}
              error={errors.time?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' },
              })}
              error={errors.price?.message}
            />
            <Input
              label="Capacity"
              type="number"
              {...register('capacity', {
                required: 'Capacity is required',
                min: { value: 1, message: 'Capacity must be at least 1' },
              })}
              error={errors.capacity?.message}
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowEventModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingEvent ? 'Update Event' : 'Create Event'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Bookings Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Bookings for ${selectedEvent?.title}`}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {getBookingsByEventId(selectedEvent.id)
              .filter((b) => b.status !== 'cancelled')
              .length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet for this event.</p>
            ) : (
              <div className="space-y-3">
                {getBookingsByEventId(selectedEvent.id)
                  .filter((b) => b.status !== 'cancelled')
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Booking #{booking.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">Date: {formatDate(booking.date)}</p>
                        <p className="text-sm text-gray-600">Price: ${booking.price}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {booking.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListerDashboard;

