import { useState } from 'react';
import useBookingsStore from '../../store/bookingsStore';
import { showToast } from '../../utils/toast';
import Button from '../ui/Button';

const BookingApproval = ({ booking }) => {
  const [rejectMessage, setRejectMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateBookingStatus = useBookingsStore((state) => state.updateBookingStatus);

  const handleConfirm = async () => {
    setIsUpdating(true);
    const result = await updateBookingStatus(booking.id, 'confirmed');
    if (result.success) {
      showToast('Booking confirmed successfully', 'success');
    } else {
      showToast(result.error || 'Failed to confirm booking', 'error');
    }
    setIsUpdating(false);
  };

  const handleReject = async () => {
    if (!rejectMessage.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    setIsUpdating(true);
    const result = await updateBookingStatus(booking.id, 'rejected', rejectMessage);
    if (result.success) {
      showToast('Booking rejected', 'success');
      setShowRejectForm(false);
      setRejectMessage('');
    } else {
      showToast(result.error || 'Failed to reject booking', 'error');
    }
    setIsUpdating(false);
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{booking.event?.title}</h4>
          <p className="text-sm text-gray-600">Booking #{booking.id.slice(-6)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">User:</span>
          <p className="font-medium">{booking.user?.email}</p>
        </div>
        <div>
          <span className="text-gray-500">Phone:</span>
          <p className="font-medium">{booking.phone_number}</p>
        </div>
        <div>
          <span className="text-gray-500">ID Card:</span>
          <p className="font-medium">{booking.id_card_number}</p>
        </div>
        <div>
          <span className="text-gray-500">Date/Time:</span>
          <p className="font-medium">{formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}</p>
        </div>
      </div>

      {booking.note && (
        <div className="mb-4">
          <span className="text-gray-500 text-sm">Note:</span>
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{booking.note}</p>
        </div>
      )}

      {booking.status === 'rejected' && booking.lister_message && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>Rejection reason:</strong> {booking.lister_message}
          </p>
        </div>
      )}

      {booking.status === 'pending' && (
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            disabled={isUpdating}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isUpdating ? 'Processing...' : 'Confirm'}
          </Button>
          {!showRejectForm ? (
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={isUpdating}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject
            </Button>
          ) : null}
        </div>
      )}

      {showRejectForm && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <textarea
            placeholder="Reason for rejection (required)"
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleReject}
              disabled={isUpdating || !rejectMessage.trim()}
              size="sm"
              variant="danger"
            >
              {isUpdating ? 'Processing...' : 'Send Rejection'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false);
                setRejectMessage('');
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingApproval;
