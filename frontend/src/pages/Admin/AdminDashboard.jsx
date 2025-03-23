import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "../../components/AdminSideBar";
import { FaUsers, FaCheckCircle, FaClock, FaHistory } from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPartners: 0,
    approvedPartners: 0,
    pendingPartners: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Admin") {
      console.log("Unauthorized access! Redirecting to home.");
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to access this page");
          setLoading(false);
          return;
        }

        // Fetch partners data
        const partnersResponse = await fetch("http://localhost:3000/api/admin/partners", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!partnersResponse.ok) {
          throw new Error("Failed to fetch partners data");
        }

        const partnersData = await partnersResponse.json();
        
        // Calculate statistics
        const totalPartners = partnersData.length;
        const approvedPartners = partnersData.filter(partner => partner.approved).length;
        const pendingPartners = totalPartners - approvedPartners;

        setStats({
          totalPartners,
          approvedPartners,
          pendingPartners,
        });

        // Set recent activities (using partner data for now)
        const activities = partnersData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(partner => ({
            type: partner.approved ? "Partner Approved" : "New Partner Registration",
            description: `${partner.restaurantName} - ${partner.fullName}`,
            date: new Date(partner.createdAt).toLocaleDateString(),
          }));

        setRecentActivities(activities);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <AdminSideBar />
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
        <AdminSideBar />
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
      <AdminSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome to <span className="text-[#fea116ff]">Admin Dashboard</span>
        </h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Partners</h3>
                <p className="text-3xl font-bold text-[#0098c9ff]">{stats.totalPartners}</p>
              </div>
              <FaUsers className="text-4xl text-[#0098c9ff] opacity-50" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Approved Partners</h3>
                <p className="text-3xl font-bold text-green-600">{stats.approvedPartners}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Partners</h3>
                <p className="text-3xl font-bold text-orange-500">{stats.pendingPartners}</p>
              </div>
              <FaClock className="text-4xl text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <FaHistory className="text-2xl text-[#fea116ff] mr-2" />
            <h2 className="text-xl font-bold">Recent Activities</h2>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {activity.type === "Partner Approved" ? (
                      <span className="text-green-600">✓ {activity.type}</span>
                    ) : (
                      <span className="text-orange-500">• {activity.type}</span>
                    )}
                  </p>
                  <p className="text-gray-600">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {activity.date}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
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

export default AdminDashboard;
