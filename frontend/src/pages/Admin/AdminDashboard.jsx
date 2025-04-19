import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSideBar from "../../components/AdminSideBar";
import { FaUsers, FaStore, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPartners: 0,
    totalTours: 0,
    activeTours: 0,
    totalReservations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch partners count
        const partnersResponse = await fetch('http://localhost:3000/api/partners');
        const partnersData = await partnersResponse.json();
        
        // Fetch tours count
        const toursResponse = await fetch('http://localhost:3000/api/tours');
        const toursData = await toursResponse.json();
        
        // Fetch reservations count
        const reservationsResponse = await fetch('http://localhost:3000/api/reservations');
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

    fetchStats();
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
          <h2 className="text-xl font-semibold text-[#001524ff] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-gray-500">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
