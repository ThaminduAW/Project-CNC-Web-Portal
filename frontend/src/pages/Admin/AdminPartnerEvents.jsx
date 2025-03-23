import { useEffect, useState } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const AdminPartnerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  // Fetch partner events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch events");
        }

        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique restaurant names for the filter
  const restaurantNames = [...new Set(events.map(event => event.restaurant))];

  // Filter events based on selected restaurant
  const filteredEvents = selectedRestaurant === "all"
    ? events
    : events.filter(event => event.restaurant === selectedRestaurant);

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff]">Partner Events</h1>
        <p className="text-gray-600 mb-6">View and manage all events organized by partner restaurants.</p>

        {/* Restaurant Filter */}
        <div className="mb-6">
          <label htmlFor="restaurant-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Restaurant:
          </label>
          <select
            id="restaurant-filter"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
          >
            <option value="all">All Restaurants</option>
            {restaurantNames.map((restaurant) => (
              <option key={restaurant} value={restaurant}>
                {restaurant}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">No events found for the selected restaurant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#0098c9ff] text-white">
                <tr>
                  <th className="p-3 text-left">Event Name</th>
                  <th className="p-3 text-left">Restaurant</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Capacity</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="border-b hover:bg-gray-100 transition">
                    <td className="p-3">{event.name}</td>
                    <td className="p-3">{event.restaurant}</td>
                    <td className="p-3">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-3">{event.time}</td>
                    <td className="p-3">{event.capacity}</td>
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
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPartnerEvents; 