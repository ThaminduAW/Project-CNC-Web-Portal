import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TourDetailsModal = ({ tour, onClose }) => {
  if (!tour) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-[#001524ff]">{tour.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#001524ff] mb-2">Tour Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Restaurant:</span> {tour.partner?.restaurantName}</p>
              <p><span className="font-medium">Date:</span> {moment(tour.date).format('MMMM D, YYYY')}</p>
              <p><span className="font-medium">Time:</span> {moment(tour.date).format('h:mm A')}</p>
              <p><span className="font-medium">Price:</span> ${tour.price}</p>
              <p>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  tour.status === 'active' ? 'bg-green-100 text-green-800' :
                  tour.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {tour.status}
                </span>
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-[#001524ff] mb-2">Description</h3>
            <p className="text-gray-600">{tour.description || 'No description available'}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-[#0098c9ff] text-white rounded hover:bg-[#0088b9ff] transition-colors"
          >
            Edit Tour
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminCalendar = ({ tours, onEventClick }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedTour, setSelectedTour] = useState(null);

  // Transform tours into calendar events
  const events = tours.map(tour => ({
    id: tour._id,
    title: `${tour.title} - ${tour.partner?.restaurantName}`,
    start: new Date(tour.date),
    end: new Date(tour.date),
    status: tour.status,
    allDay: true,
    ...tour // Include all tour data for the modal
  }));

  // Custom event component to show status
  const Event = ({ event }) => {
    return (
      <div 
        className={`p-1 rounded text-sm ${
          event.status === 'active' ? 'bg-[#0098c9ff] text-white' : 
          event.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}
      >
        <strong>{event.title}</strong>
      </div>
    );
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedTour(event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Custom toolbar component
  const CustomToolbar = ({ label }) => {
    const goToBack = () => {
      setDate(moment(date).subtract(1, view).toDate());
    };

    const goToNext = () => {
      setDate(moment(date).add(1, view).toDate());
    };

    const goToToday = () => {
      setDate(new Date());
    };

    const changeView = (newView) => {
      setView(newView);
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={goToBack}
            className="p-2 rounded bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white transition-colors"
          >
            Previous
          </button>
          <button
            onClick={goToToday}
            className="p-2 rounded bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
        <span className="text-xl font-bold text-[#001524ff]">{label}</span>
        <div className="flex space-x-2">
          <button
            onClick={() => changeView('month')}
            className={`p-2 rounded ${
              view === 'month' 
                ? 'bg-[#0098c9ff] text-white' 
                : 'bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white'
            } transition-colors`}
          >
            Month
          </button>
          <button
            onClick={() => changeView('week')}
            className={`p-2 rounded ${
              view === 'week' 
                ? 'bg-[#0098c9ff] text-white' 
                : 'bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white'
            } transition-colors`}
          >
            Week
          </button>
          <button
            onClick={() => changeView('day')}
            className={`p-2 rounded ${
              view === 'day' 
                ? 'bg-[#0098c9ff] text-white' 
                : 'bg-white text-[#001524ff] hover:bg-[#0098c9ff] hover:text-white'
            } transition-colors`}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow-md">
      <style>
        {`
          .rbc-calendar {
            background-color: white;
            border-radius: 0.5rem;
          }
          .rbc-header {
            background-color: #fdfcdcff;
            color: #001524ff;
            padding: 0.5rem;
            font-weight: bold;
          }
          .rbc-today {
            background-color: #fdfcdcff;
          }
          .rbc-event {
            border: none;
            border-radius: 0.25rem;
          }
          .rbc-day-bg + .rbc-day-bg,
          .rbc-month-row + .rbc-month-row {
            border-color: #e5e7eb;
          }
          .rbc-off-range-bg {
            background-color: #f9fafb;
          }
          .rbc-toolbar button {
            border: 1px solid #e5e7eb;
          }
          .rbc-toolbar button:active,
          .rbc-toolbar button.rbc-active {
            background-color: #0098c9ff;
            color: white;
          }
          .rbc-toolbar button:hover {
            background-color: #0098c9ff;
            color: white;
          }
        `}
      </style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        components={{
          event: Event,
          toolbar: CustomToolbar
        }}
        onSelectEvent={handleEventClick}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
      />
      {selectedTour && (
        <TourDetailsModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
        />
      )}
    </div>
  );
};

export default AdminCalendar; 