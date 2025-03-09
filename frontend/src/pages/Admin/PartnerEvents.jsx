import { useEffect, useState } from "react";
import AdminSideBar from "../../components/AdminSideBar";

const PartnerEvents = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff]">Upcoming Partner Events</h1>
        <p className="text-gray-600 mb-6">View upcoming reservations made by customers.</p>

        {loading ? (
          <p className="text-center text-gray-500">Loading reservations...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : reservations.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming reservations found.</p>
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
                {reservations.map((reservation) => (
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
