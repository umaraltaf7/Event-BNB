import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useBookingsStore from '../../store/bookingsStore';
import { showToast } from '../../utils/toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const BookingForm = ({ eventId, eventTitle, onSuccess, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addBooking = useBookingsStore((state) => state.addBooking);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const result = await addBooking({
      eventId,
      phoneNumber: data.phoneNumber,
      idCardNumber: data.idCardNumber,
      date: data.date,
      time: data.time,
      note: data.note
    });

    if (result.success) {
      showToast('Booking submitted successfully! Awaiting approval.', 'success');
      reset();
      onSuccess?.();
      onClose();
    } else {
      showToast(result.error || 'Booking failed', 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Book Event: ${eventTitle}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          {...register('phoneNumber', { 
            required: 'Phone number is required',
            pattern: {
              value: /^[+]?[\d\s\-\(\)]+$/,
              message: 'Please enter a valid phone number'
            }
          })}
          error={errors.phoneNumber?.message}
        />

        <Input
          label="ID Card Number"
          {...register('idCardNumber', { 
            required: 'ID card number is required',
            minLength: {
              value: 6,
              message: 'ID card number must be at least 6 characters'
            }
          })}
          error={errors.idCardNumber?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Booking Date"
            type="date"
            {...register('date', { 
              required: 'Date is required',
              validate: value => {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today || 'Date cannot be in the past';
              }
            })}
            error={errors.date?.message}
          />

          <Input
            label="Booking Time"
            type="time"
            {...register('time', { 
              required: 'Time is required'
            })}
            error={errors.time?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optional Note
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            rows="3"
            placeholder="Any special requests or notes..."
            {...register('note')}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Book Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingForm;
