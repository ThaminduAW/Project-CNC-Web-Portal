import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaClock, FaUsers, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { baseURL } from '../utils/baseURL';

const AvailabilityViewer = ({ restaurantId, date, onTimeSlotSelect }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the authentication token
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${baseURL}/availability/${restaurantId}/${format(new Date(date), 'yyyy-MM-dd')}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch availability');
        }

        const data = await response.json();
        // Filter only available slots
        const availableSlots = data.timeSlots?.filter(slot => slot.isAvailable && slot.maxCapacity > slot.currentBookings) || [];
        // Sort slots by start time
        availableSlots.sort((a, b) => {
          const timeA = new Date(`2000/01/01 ${a.startTime}`).getTime();
          const timeB = new Date(`2000/01/01 ${b.startTime}`).getTime();
          return timeA - timeB;
        });
        
        setTimeSlots(availableSlots);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load available time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId && date) {
      fetchAvailability();
    }
  }, [restaurantId, date]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onTimeSlotSelect(slot);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fea116ff] mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>{error}</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No available time slots for this date.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Available Time Slots</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedSlot === slot
                ? 'border-[#fea116ff] bg-[#fff8e6]'
                : 'border-gray-200 hover:border-[#fea116ff] hover:bg-[#fff8e6]'
            }`}
            onClick={() => handleSlotSelect(slot)}
          >
            <div className="flex items-center mb-2">
              <FaClock className="text-[#fea116ff] mr-2" />
              <span className="font-medium">
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                <span>Available: {slot.maxCapacity - slot.currentBookings} seats</span>
              </div>
              
              {slot.price > 0 && (
                <div className="flex items-center">
                  <FaDollarSign className="mr-2" />
                  <span>Price: ${slot.price}</span>
                </div>
              )}
              
              {slot.description && (
                <div className="flex items-center">
                  <FaInfoCircle className="mr-2" />
                  <span>{slot.description}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityViewer; 