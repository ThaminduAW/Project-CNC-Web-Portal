import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';

const AvailabilityViewer = ({ restaurantId, date, onTimeSlotSelect }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!restaurantId || !date) {
        console.log('Missing required props:', { restaurantId, date });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:3000/api/availability/${restaurantId}/${date}`);
        
        if (response.data && response.data.timeSlots) {
          setTimeSlots(response.data.timeSlots);
        } else {
          setTimeSlots([]);
          toast.info('No availability set for this date');
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        setError("Failed to fetch availability");
        setTimeSlots([]);
        if (error.response?.status === 404) {
          toast.info('No availability set for this date');
        } else {
          toast.error('Failed to fetch availability');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [restaurantId, date]);

  const handleTimeSlotClick = (slot) => {
    if (slot.isAvailable && slot.currentBookings < slot.maxCapacity) {
      setSelectedSlot(slot);
      onTimeSlotSelect(slot);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No time slots available for this date
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {timeSlots.map((slot, index) => {
        const isBooked = !slot.isAvailable || slot.currentBookings >= slot.maxCapacity;
        const isSelected = selectedSlot && 
          selectedSlot.startTime === slot.startTime && 
          selectedSlot.endTime === slot.endTime;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleTimeSlotClick(slot)}
            disabled={isBooked}
            className={`p-4 border rounded-lg text-center transition-all ${
              isBooked
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isSelected
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
            {isBooked && (
              <div className="text-sm text-red-500 mt-1">
                Booked
              </div>
            )}
            {isSelected && !isBooked && (
              <div className="text-sm text-blue-500 mt-1">
                Selected
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvailabilityViewer; 