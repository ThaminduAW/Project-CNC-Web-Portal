import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSideBar from "../../components/AdminSideBar";
import { FaUsers, FaStore, FaCalendarAlt, FaChartLine, FaBell, FaEnvelope, FaUserPlus, FaEdit } from 'react-icons/fa';
import { baseURL } from '../../utils/baseURL';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPartners: 0,
    totalTours: 0,
    activeTours: 0,
    totalReservations: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch partners count
        const partnersResponse = await fetch(`${baseURL}/partners`);
        const partnersData = await partnersResponse.json();
        
        // Fetch tours count
        const toursResponse = await fetch(`${baseURL}/tours`);
        const toursData = await toursResponse.json();
        
        // Fetch reservations count
        const reservationsResponse = await fetch(`${baseURL}/reservations`);
        const reservationsData = await reservationsResponse.json();

        setStats({
          totalPartners: partnersData.length,
          totalTours: toursData.length,
          activeTours: toursData.filter(tour => tour.status === 'active').length,
          totalReservations: reservationsData.length
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch recent requests
        const requestsResponse = await fetch(`${baseURL}/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const requestsData = await requestsResponse.json();

        // Fetch recent messages
        const messagesResponse = await fetch(`${baseURL}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const messagesData = await messagesResponse.json();

        // Fetch pending partner sign-ups
        const partnersResponse = await fetch(`${baseURL}/admin/partners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const partnersData = await partnersResponse.json();
        const pendingPartners = partnersData.filter(partner => !partner.approved);

        // Combine and format activities
        const activities = [
          ...requestsData.map(request => ({
            type: 'request',
            description: `${request.type} request from ${request.submittedBy}`,
            time: new Date(request.createdAt).toLocaleString(),
            status: request.status,
            icon: FaEdit
          })),
          ...messagesData.slice(0, 5).map(message => ({
            type: 'message',
            description: `New message from ${message.sender.fullName}`,
            time: new Date(message.createdAt).toLocaleString(),
            status: message.read ? 'read' : 'unread',
            icon: FaEnvelope
          })),
          ...pendingPartners.map(partner => ({
            type: 'signup',
            description: `New partner registration: ${partner.restaurantName}`,
            time: new Date(partner.createdAt).toLocaleString(),
            status: 'pending',
            icon: FaUserPlus
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time))
         .slice(0, 10); // Get only the 10 most recent activities

        setRecentActivities(activities);
      } catch (err) {
        console.error('Error fetching recent activities:', err);
      }
    };

    fetchStats();
    fetchRecentActivities();
    // Refresh activities every minute
    const interval = setInterval(fetchRecentActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex bg-[#fdfcdcff] min-h-screen">
        <AdminSideBar />
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0098c9ff]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-[#fdfcdcff] min-h-screen">
        <AdminSideBar />
        <div className="flex-1 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      <AdminSideBar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#001524ff] mb-6">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Partners Card */}
          <Link to="/admin/partners" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Partners</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{stats.totalPartners}</h3>
              </div>
              <div className="bg-[#0098c9ff] p-3 rounded-full">
                <FaStore className="text-white text-xl" />
              </div>
            </div>
          </Link>

          {/* Tours Card */}
          <Link to="/admin/tours" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tours</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{stats.totalTours}</h3>
              </div>
              <div className="bg-[#fea116ff] p-3 rounded-full">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
            </div>
          </Link>

          {/* Active Tours Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Tours</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{stats.activeTours}</h3>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <FaChartLine className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Reservations Card */}
          <Link to="/admin/reservations" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Reservations</p>
                <h3 className="text-2xl font-bold text-[#001524ff]">{stats.totalReservations}</h3>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <FaUsers className="text-white text-xl" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#001524ff] mb-4 flex items-center">
            <FaBell className="mr-2 text-[#0098c9ff]" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="bg-[#0098c9ff] p-2 rounded-full mr-3">
                      <activity.icon className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'unread' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent activity to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
