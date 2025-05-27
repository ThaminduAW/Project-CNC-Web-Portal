import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import PartnerSideBar from '../../components/PartnerSideBar';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock, FaUsers, FaMapMarkerAlt, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from '../../utils/baseURL';
import { toast } from 'react-toastify';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';

const localizer = momentLocalizer(moment);

const PartnerCalendar = () => {
  const [events, setEvents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    type: 'event',
    maxCapacity: 20,
    currentBookings: 0,
    isRecurring: false,
    recurringDays: []
  });

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id;
  };

  // Fetch events and reservations
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      // For now, we'll create some mock events since the events API doesn't exist yet
      // In the future, you can add the events API endpoint
      const mockEvents = [
        {
          id: '1',
          title: 'Special Wine Tasting Event',
          start: new Date(2024, 11, 25, 18, 0), // Dec 25, 2024, 6:00 PM
          end: new Date(2024, 11, 25, 21, 0),   // Dec 25, 2024, 9:00 PM
          description: 'Annual Christmas wine tasting with local wines',
          type: 'event',
          maxCapacity: 30,
          currentBookings: 15
        },
        {
          id: '2',
          title: 'New Year\'s Dinner Special',
          start: new Date(2024, 11, 31, 19, 0), // Dec 31, 2024, 7:00 PM
          end: new Date(2024, 11, 31, 23, 59),   // Dec 31, 2024, 11:59 PM
          description: 'Celebrate New Year with our special dinner menu',
          type: 'event',
          maxCapacity: 50,
          currentBookings: 35
        }
      ];

      // Fetch reservations using existing API
      const reservationsResponse = await axios.get(`${baseURL}/reservations/partner`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform reservations data for calendar
      const reservationsData = reservationsResponse.data.map(reservation => {
        // Parse the date and time
        const reservationDate = new Date(reservation.date);
        
        // Extract time from the time string (format: "HH:MM - HH:MM")
        let startTime, endTime;
        if (reservation.time && reservation.time.includes(' - ')) {
          const [start, end] = reservation.time.split(' - ');
          const [startHour, startMin] = start.split(':').map(Number);
          const [endHour, endMin] = end.split(':').map(Number);
          
          startTime = new Date(reservationDate);
          startTime.setHours(startHour, startMin, 0, 0);
          
          endTime = new Date(reservationDate);
          endTime.setHours(endHour, endMin, 0, 0);
        } else {
          // Default to 2-hour duration if time not properly formatted
          startTime = new Date(reservationDate);
          endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000));
        }

        return {
          id: reservation._id,
          title: `Reservation - ${reservation.customerName || 'Guest'}`,
          start: startTime,
          end: endTime,
          type: 'reservation',
          partySize: reservation.numberOfGuests,
          status: reservation.status,
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          instructions: reservation.instructions,
          resource: reservation
        };
      });

      setEvents(mockEvents);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      } else {
        toast.error('Failed to load calendar data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Combine events and reservations for display
  const allCalendarItems = [...events, ...reservations];

  // Event style getter
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (event.type === 'event') {
      backgroundColor = '#fea116';
      borderColor = '#fea116';
    } else if (event.type === 'reservation') {
      if (event.status === 'confirmed') {
        backgroundColor = '#28a745';
        borderColor = '#28a745';
      } else if (event.status === 'pending') {
        backgroundColor = '#ffc107';
        borderColor = '#ffc107';
      } else if (event.status === 'cancelled') {
        backgroundColor = '#dc3545';
        borderColor = '#dc3545';
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '4px',
        border: `1px solid ${borderColor}`,
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (event.type === 'event') {
      setShowEventModal(true);
    } else {
      setShowReservationModal(true);
    }
  };

  // Handle slot selection (creating new event)
  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      ...newEvent,
      start,
      end: new Date(start.getTime() + (2 * 60 * 60 * 1000)) // Default 2 hour duration
    });
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Save new event
  const handleSaveEvent = async () => {
    try {
      // For now, we'll just update the local state since there's no events API
      // In the future, you can implement the actual API calls here
      
      if (selectedEvent) {
        // Update existing event in local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === selectedEvent.id 
              ? { ...event, title: selectedEvent.title, description: selectedEvent.description, start: selectedEvent.start, end: selectedEvent.end, maxCapacity: selectedEvent.maxCapacity }
              : event
          )
        );
        toast.success('Event updated successfully');
      } else {
        // Create new event in local state
        const newEventData = {
          id: Date.now().toString(), // Simple ID generation for demo
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          type: 'event',
          maxCapacity: newEvent.maxCapacity,
          currentBookings: 0
        };
        
        setEvents(prevEvents => [...prevEvents, newEventData]);
        toast.success('Event created successfully');
      }

      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        type: 'event',
        maxCapacity: 20,
        currentBookings: 0,
        isRecurring: false,
        recurringDays: []
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      // For now, we'll just update the local state since there's no events API
      // In the future, you can implement the actual API calls here
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
      setShowEventModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Update reservation status
  const handleUpdateReservationStatus = async (reservationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/reservations/${reservationId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Reservation ${status} successfully`);
      setShowReservationModal(false);
      fetchCalendarData();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex">
        <div className="fixed left-0 top-0 h-full z-30">
          <PartnerSideBar />
        </div>
        <main className="flex-1 ml-64 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-b-4 border-[#fea116ff]"></div>
            <p className="mt-4 text-base md:text-lg text-gray-600 font-semibold">Loading calendar...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcdcff] flex">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <main className="flex-1 ml-64 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#001524ff]">
              Restaurant <span className="text-[#fea116ff]">Calendar</span>
            </h1>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setNewEvent({
                  title: '',
                  description: '',
                  start: new Date(),
                  end: new Date(),
                  type: 'event',
                  maxCapacity: 20,
                  currentBookings: 0,
                  isRecurring: false,
                  recurringDays: []
                });
                setShowEventModal(true);
              }}
              className="bg-[#fea116ff] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-[#fea116cc] flex items-center gap-2 shadow-lg transition-all duration-300 text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <FaPlus /> Add Event
            </button>
          </div>

          {/* Calendar Legend */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold mb-3">Calendar Legend</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-[#fea116ff] rounded flex-shrink-0"></div>
                <span className="text-xs md:text-sm">Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded flex-shrink-0"></div>
                <span className="text-xs md:text-sm">Confirmed Reservations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded flex-shrink-0"></div>
                <span className="text-xs md:text-sm">Pending Reservations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded flex-shrink-0"></div>
                <span className="text-xs md:text-sm">Cancelled Reservations</span>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg overflow-hidden">
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={allCalendarItems}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                popup
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                components={{
                  event: ({ event }) => (
                    <div className="truncate">
                      <strong className="block">{event.title}</strong>
                      {event.type === 'reservation' && (
                        <div className="text-xs opacity-90">
                          {event.partySize} guests
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#001524ff]">
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={selectedEvent ? selectedEvent.title : newEvent.title}
                    onChange={(e) => {
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, title: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, title: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedEvent ? selectedEvent.description : newEvent.description}
                    onChange={(e) => {
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, description: e.target.value });
                      } else {
                        setNewEvent({ ...newEvent, description: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    rows="3"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={moment(selectedEvent ? selectedEvent.start : newEvent.start).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value);
                        if (selectedEvent) {
                          setSelectedEvent({ ...selectedEvent, start: newStart });
                        } else {
                          setNewEvent({ ...newEvent, start: newStart });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={moment(selectedEvent ? selectedEvent.end : newEvent.end).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value);
                        if (selectedEvent) {
                          setSelectedEvent({ ...selectedEvent, end: newEnd });
                        } else {
                          setNewEvent({ ...newEvent, end: newEnd });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    value={selectedEvent ? selectedEvent.maxCapacity : newEvent.maxCapacity}
                    onChange={(e) => {
                      const capacity = parseInt(e.target.value) || 0;
                      if (selectedEvent) {
                        setSelectedEvent({ ...selectedEvent, maxCapacity: capacity });
                      } else {
                        setNewEvent({ ...newEvent, maxCapacity: capacity });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    min="1"
                    placeholder="Maximum number of guests"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEvent}
                  className="flex-1 bg-[#fea116ff] text-white py-2 px-4 rounded-lg hover:bg-[#fea116cc] transition-colors"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
                
                {selectedEvent && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
                
                <button
                  onClick={() => setShowEventModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Modal */}
        {showReservationModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#001524ff]">
                Reservation Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-[#fea116ff]" />
                  <span className="font-medium">Customer:</span>
                  <span>{selectedEvent.customerName || 'Guest'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaUsers className="text-[#fea116ff]" />
                  <span className="font-medium">Party Size:</span>
                  <span>{selectedEvent.partySize} guests</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#fea116ff]" />
                  <span className="font-medium">Date & Time:</span>
                  <span>{moment(selectedEvent.start).format('MMMM Do, YYYY [at] h:mm A')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#fea116ff]" />
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedEvent.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedEvent.status?.charAt(0).toUpperCase() + selectedEvent.status?.slice(1)}
                  </span>
                </div>
                
                                 {selectedEvent.customerEmail && (
                   <div className="flex items-center gap-2">
                     <span className="font-medium">Email:</span>
                     <span>{selectedEvent.customerEmail}</span>
                   </div>
                 )}
                 
                 {selectedEvent.instructions && (
                   <div className="flex items-start gap-2">
                     <span className="font-medium">Instructions:</span>
                     <span>{selectedEvent.instructions}</span>
                   </div>
                 )}
              </div>

              {selectedEvent.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleUpdateReservationStatus(selectedEvent.id, 'confirmed')}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateReservationStatus(selectedEvent.id, 'cancelled')}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowReservationModal(false)}
                className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerCalendar; 