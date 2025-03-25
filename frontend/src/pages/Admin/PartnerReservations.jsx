import { useEffect, useState } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const PartnerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch("http://localhost:3000/api/reservations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  const restaurantNames = [...new Set(reservations.map(res => res.restaurant))];
  const filteredReservations = selectedRestaurant === "all"
    ? reservations
    : reservations.filter(res => res.restaurant === selectedRestaurant);

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      <AdminSideBar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff]">Partner Reservations</h1>
        <p className="mb-6 text-gray-600">View and manage all customer reservations across partner restaurants.</p>

        <div className="mb-6">
          <label htmlFor="restaurant-filter" className="block mb-2 text-sm font-medium text-gray-700">
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
            <table className="w-full overflow-hidden bg-white rounded-lg shadow-md">
              <thead className="bg-[#0098c9ff] text-white">
                <tr>
                  <th className="p-3 text-left">Customer Name</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Restaurant</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="transition border-b hover:bg-gray-100">
                    <td className="p-3">{reservation.name}</td>
                    <td className="p-3">{reservation.contact || "N/A"}</td>
                    <td className="p-3">{reservation.email}</td>
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

export default PartnerReservations;
