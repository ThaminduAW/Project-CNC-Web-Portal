import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';

const AvailabilityManager = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultTimeSlots = [
    { startTime: '09:00', endTime: '10:00', maxCapacity: 20, isAvailable: true },
    { startTime: '10:00', endTime: '11:00', maxCapacity: 20, isAvailable: true },
    { startTime: '11:00', endTime: '12:00', maxCapacity: 20, isAvailable: true },
    { startTime: '12:00', endTime: '13:00', maxCapacity: 20, isAvailable: true },
    { startTime: '13:00', endTime: '14:00', maxCapacity: 20, isAvailable: true },
    { startTime: '14:00', endTime: '15:00', maxCapacity: 20, isAvailable: true },
    { startTime: '15:00', endTime: '16:00', maxCapacity: 20, isAvailable: true },
    { startTime: '16:00', endTime: '17:00', maxCapacity: 20, isAvailable: true },
    { startTime: '17:00', endTime: '18:00', maxCapacity: 20, isAvailable: true },
    { startTime: '18:00', endTime: '19:00', maxCapacity: 20, isAvailable: true },
    { startTime: '19:00', endTime: '20:00', maxCapacity: 20, isAvailable: true },
    { startTime: '20:00', endTime: '21:00', maxCapacity: 20, isAvailable: true },
  ];

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/availability/${user._id}/${selectedDate}`);
      setTimeSlots(response.data.timeSlots);
    } catch (error) {
      if (error.response?.status === 404) {
        setTimeSlots(defaultTimeSlots);
      } else {
        toast.error('Failed to fetch availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post('/api/availability', {
        restaurantId: user._id,
        date: selectedDate,
        timeSlots
      });
      toast.success('Availability updated successfully');
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: field === 'maxCapacity' ? parseInt(value) : value
    };
    setTimeSlots(updatedSlots);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
          max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Time Slot</th>
              <th className="px-4 py-2">Max Capacity</th>
              <th className="px-4 py-2">Available</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">
                  {slot.startTime} - {slot.endTime}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={slot.maxCapacity}
                    onChange={(e) => handleSlotChange(index, 'maxCapacity', e.target.value)}
                    className="w-20 p-1 border rounded"
                    min="1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(e) => handleSlotChange(index, 'isAvailable', e.target.checked)}
                    className="h-4 w-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityManager; 