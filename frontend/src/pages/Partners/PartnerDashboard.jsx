import React, { useState, useEffect } from 'react';
import PartnerSideBar from "../../components/PartnerSideBar";
import { FaCalendarAlt, FaUsers, FaStore, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaRedo } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from '../../utils/baseURL';  

const API_URL = import.meta.env.VITE_API_URL || `${baseURL}`;

const PartnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?._id || userData?.id;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');
      if (!partnerId) {
        setError('Partner ID not found. Please login again.');
        setLoading(false);
        return;
      }
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_URL}/partners/${partnerId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      let errorMsg = 'Failed to fetch dashboard data. Please try again later.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg += ` (Server: ${error.response.data.message})`;
        if (error.response.data.message.toLowerCase().includes('token expired')) {
          // Remove token and user, redirect to signin
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
          return;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Optionally, poll every 30s
    // const interval = setInterval(fetchDashboardData, 30000);
    // return () => clearInterval(interval);
  }, []);

  // UI: Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex">
        <PartnerSideBar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#fea116ff]"></div>
            <p className="mt-4 text-lg text-gray-600 font-semibold">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // UI: Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex">
        <PartnerSideBar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 flex flex-col items-center shadow-lg">
            <p className="text-red-600 text-xl font-bold mb-2">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#fea116ff] text-white rounded hover:bg-[#ffb84d] transition"
            >
              <FaRedo /> Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // UI: No Data
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex">
        <PartnerSideBar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No dashboard data available</h2>
            <button
              onClick={fetchDashboardData}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#fea116ff] text-white rounded hover:bg-[#ffb84d] transition"
            >
              <FaRedo /> Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // UI: Main Dashboard
  return (
    <div className="min-h-screen bg-[#fdfcdcff] flex">
      <PartnerSideBar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-[#001524ff]">
          Welcome to <span className="text-[#fea116ff]">Partner Dashboard</span>
        </h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Reservations Card */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Reservations</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{dashboardData.totalReservations}</h3>
              </div>
              <div className="bg-[#0098c9ff] p-3 rounded-full">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Customers</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{dashboardData.totalCustomers}</h3>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <FaUsers className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Profile */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center border-b pb-4">
            <FaStore className="text-2xl text-[#fea116ff] mr-2" />
            Restaurant Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaStore className="text-[#fea116ff] mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Restaurant Name</p>
                    <p className="font-semibold text-gray-800">{dashboardData.profile.name}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-[#fea116ff] mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-800">{dashboardData.profile.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaPhone className="text-[#fea116ff] mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-800">{dashboardData.profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaEnvelope className="text-[#fea116ff] mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-semibold text-gray-800">{dashboardData.profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FaCalendarAlt className="text-2xl text-[#fea116ff] mr-2" />
            Recent Activities
          </h2>
          <div className="space-y-4">
            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {activity.type === "reservation" ? (
                        <span className="text-green-600">✓ {activity.description}</span>
                      ) : (
                        <span className="text-orange-500">• {activity.description}</span>
                      )}
                    </p>
                    <p className="text-gray-600">{activity.time}</p>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    activity.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;