import { useEffect, useState } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const AdminPartnerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch partner events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch events");
        }

        // Transform the data to match our frontend structure
        const transformedEvents = data.map(event => ({
          _id: event._id,
          name: event.title,
          restaurant: event.partner?.restaurantName || 'Unknown Restaurant',
          date: event.availableFrom,
          time: new Date(event.availableFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          capacity: event.price, // Using price as capacity for now, adjust if needed
          status: event.status,
          description: event.description,
          location: event.location,
          image: event.image
        }));

        setEvents(transformedEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique restaurant names for the filter
  const restaurantNames = [...new Set(events.map(event => event.restaurant))].filter(Boolean);

  // Sorting function
  const sortEvents = (events) => {
    if (!sortConfig.key) return events;
    
    return [...events].sort((a, b) => {
      if (!a || !b) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter events based on all criteria
  const filteredEvents = events.filter(event => {
    if (!event) return false;
    
    const matchesRestaurant = selectedRestaurant === "all" || event.restaurant === selectedRestaurant;
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesSearch = searchQuery === "" || 
      (event.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (event.restaurant?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end && event.date) {
      const eventDate = new Date(event.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = eventDate >= startDate && eventDate <= endDate;
    }

    return matchesRestaurant && matchesStatus && matchesSearch && matchesDateRange;
  });

  // Sort filtered events
  const sortedEvents = sortEvents(filteredEvents);

  // Pagination
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle event deletion
  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Update the events state by removing the deleted event
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff]">Partner Events</h1>
        <p className="text-gray-600 mb-6">View and manage all events organized by partner restaurants.</p>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Restaurant Filter */}
            <div>
              <label htmlFor="restaurant-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Restaurant:
              </label>
              <select
                id="restaurant-filter"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              >
                <option value="all">All Restaurants</option>
                {restaurantNames.map((restaurant, index) => (
                  <option key={`restaurant-${index}-${restaurant}`} value={restaurant}>
                    {restaurant}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
                />
              </div>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search:
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0098c9ff]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-[#0098c9ff] text-white">
                  <tr>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('name')}>
                      Event Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('restaurant')}>
                      Restaurant {sortConfig.key === 'restaurant' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('date')}>
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('time')}>
                      Time {sortConfig.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('capacity')}>
                      Price {sortConfig.key === 'capacity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('status')}>
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => (
                    <tr key={event._id} className="border-b hover:bg-gray-100 transition">
                      <td className="p-3">{event.name}</td>
                      <td className="p-3">{event.restaurant}</td>
                      <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-3">{event.time}</td>
                      <td className="p-3">${event.capacity}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="text-[#0098c9ff] hover:text-[#001524ff] mr-2">
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={`page-${index + 1}`}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-[#0098c9ff] border-[#0098c9ff] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPartnerEvents; 