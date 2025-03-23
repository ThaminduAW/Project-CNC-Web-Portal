import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PartnerSideBar from "../../components/PartnerSideBar";
import { FaUsers, FaCalendarCheck, FaRegClock, FaChartLine, FaBell } from "react-icons/fa";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    completedReservations: 0,
    totalRevenue: 0
  });

  const fetchPartnerStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:3000/api/partner/stats", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Unable to connect to the server. Please check your internet connection or try again later.");
      } else {
        setError(err.message);
      }
      // Keep showing the last known stats if available
      console.error("Error fetching partner stats:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Partner") {
      console.log("Unauthorized access! Redirecting to home.");
      navigate("/");
      return;
    }
    setPartner(user);
    
    // Fetch initial stats
    fetchPartnerStats()
      .finally(() => setLoading(false));

    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchPartnerStats, 300000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#3498DB]"></div>
      </div>
    );
  }

  // Show error in a toast-like component if there's an error but we have stats
  const ErrorToast = () => error ? (
    <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
      <p>{error}</p>
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <ErrorToast />
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#2C3E50]">
              Welcome back, {partner?.fullName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your restaurant today.</p>
          </div>
          <button className="relative p-2 text-gray-600 hover:text-[#3498DB] transition-colors">
            <FaBell className="text-2xl" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="text-[#3498DB] text-xl" />
              </div>
              <span className="text-sm font-medium text-green-500">+12.5%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Reservations</h3>
            <p className="text-3xl font-bold text-[#2C3E50] mt-2">{stats.totalReservations}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaRegClock className="text-[#F1C40F] text-xl" />
              </div>
              <span className="text-sm font-medium text-yellow-500">Pending</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Pending Reservations</h3>
            <p className="text-3xl font-bold text-[#2C3E50] mt-2">{stats.pendingReservations}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCalendarCheck className="text-[#2ECC71] text-xl" />
              </div>
              <span className="text-sm font-medium text-green-500">Completed</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Completed Reservations</h3>
            <p className="text-3xl font-bold text-[#2C3E50] mt-2">{stats.completedReservations}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaChartLine className="text-[#9B59B6] text-xl" />
              </div>
              <span className="text-sm font-medium text-purple-500">Revenue</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-[#2C3E50] mt-2">${stats.totalRevenue}</p>
          </div>
        </div>

        {/* Restaurant Details Card */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)] mb-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Restaurant Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Restaurant Name</p>
                <p className="text-lg font-semibold text-[#2C3E50] pb-2 border-b border-gray-100">
                  {partner?.restaurantName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="text-lg font-semibold text-[#2C3E50] pb-2 border-b border-gray-100">
                  {partner?.email}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="text-lg font-semibold text-[#2C3E50] pb-2 border-b border-gray-100">
                  {partner?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-lg font-semibold text-[#2C3E50] pb-2 border-b border-gray-100">
                  {partner?.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#2C3E50]">Recent Activity</h2>
            <button className="text-[#3498DB] hover:text-[#2980B9] font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Event</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">No recent activity</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;