import { useEffect, useState } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const PartnerEvents = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  // Fetch upcoming reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/reservations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch reservations");
        }

        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Get unique restaurant names for the filter
  const restaurantNames = [...new Set(reservations.map(res => res.restaurant))];

  // Filter reservations based on selected restaurant
  const filteredReservations = selectedRestaurant === "all"
    ? reservations
    : reservations.filter(res => res.restaurant === selectedRestaurant);

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff]">Partner Reservations</h1>
        <p className="text-gray-600 mb-6">View and manage all customer reservations across partner restaurants.</p>

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
          <p className="text-center text-gray-500">Loading reservations...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredReservations.length === 0 ? (
          <p className="text-center text-gray-500">No reservations found for the selected restaurant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#0098c9ff] text-white">
                <tr>
                  <th className="p-3 text-left">Customer Name</th>
                  <th className="p-3 text-left">Restaurant</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="border-b hover:bg-gray-100 transition">
                    <td className="p-3">{reservation.name}</td>
                    <td className="p-3">{reservation.restaurant}</td>
                    <td className="p-3">{new Date(reservation.date).toLocaleDateString()}</td>
                    <td className="p-3">{reservation.time}</td>
                    <td className="p-3">{reservation.instructions || "N/A"}</td>
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

export default PartnerEvents;
