import React, { useState, useEffect } from 'react';
import PartnerSideBar from "../../components/PartnerSideBar";
import { FaCalendarAlt, FaUsers, FaClock, FaStore, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PartnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    totalEvents: 0,
    totalCustomers: 0,
    profile: {
      name: "",
      address: "",
      phone: "",
      email: "",
      cuisine: "",
      rating: 0
    },
    recentActivities: []
  });

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?.id;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');
      
      if (!partnerId) {
        setError('Partner ID not found. Please login again.');
        return;
      }

      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(`${API_URL}/partners/${partnerId}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data. Please try again later.');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <PartnerSideBar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <PartnerSideBar />
        <div className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome to <span className="text-[#fea116ff]">Partner Dashboard</span>
        </h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Reservations</h3>
                <p className="text-3xl font-bold text-[#0098c9ff]">{dashboardData.totalReservations}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-[#0098c9ff] opacity-50" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Menu</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData.totalEvents}</p>
              </div>
              <FaStore className="text-4xl text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-purple-600">{dashboardData.totalCustomers}</p>
              </div>
              <FaUsers className="text-4xl text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Restaurant Profile */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FaStore className="text-2xl text-[#fea116ff] mr-2" />
            Restaurant Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <FaStore className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{dashboardData.profile.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-semibold">{dashboardData.profile.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{dashboardData.profile.phone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{dashboardData.profile.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaStore className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Cuisine</p>
                  <p className="font-semibold">{dashboardData.profile.cuisine}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaStar className="text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold">{dashboardData.profile.rating} / 5</p>
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
            {dashboardData.recentActivities.map((activity, index) => (
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
            ))}
            {dashboardData.recentActivities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;