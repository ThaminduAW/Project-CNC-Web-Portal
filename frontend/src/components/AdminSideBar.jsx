import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaUsers, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome, FaComments, FaBuilding, FaCalendarCheck, FaClipboardList, FaBell, FaStar } from "react-icons/fa";
import logo from "../assets/logo.png"; // Ensure path is correct
import defaultProfile from "../assets/default-profile.png"; // Default profile image
import { baseURL } from '../utils/baseURL';

const AdminSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState({ 
    firstName: "",
    lastName: "",
    email: "",
    role: "Admin", 
    profilePhoto: defaultProfile 
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Listen for changes in localStorage
  useEffect(() => {
    const loadAdminData = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "Admin") {
        setAdmin({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          role: user.role || "Admin",
          profilePhoto: user.profilePhoto || defaultProfile,
        });
      } else {
        navigate("/signin");
      }
    };

    // Load initial data
    loadAdminData();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadAdminData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for profile updates
    const handleProfileUpdate = (e) => {
      loadAdminData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${baseURL}/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch requests");

        const data = await response.json();
        const pendingCount = data.filter(req => req.status === 'pending').length;
        setPendingRequests(pendingCount);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.pathname === '/admin/messages') {
      setShowBadge(false);
    } else {
      setShowBadge(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${baseURL}/messages/unread`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch unread count");

        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/admin/partners", icon: FaBuilding, label: "Partners" },
    { path: "/admin/requests", icon: FaBell, label: "Requests", badge: pendingRequests },
    { path: "/admin/tours", icon: FaCalendarAlt, label: "Tours" },
    { path: "/admin/reservations", icon: FaCalendarCheck, label: "Reservations" },
    { path: "/admin/messages", icon: FaComments, label: "Messages", badge: showBadge && unreadCount },
    { path: "/admin/feedback", icon: FaStar, label: "Feedback" },
    { path: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className="h-screen w-64 bg-[#001524ff] text-white flex flex-col shadow-lg">
      {/* Logo & Name */}
      <div className="flex items-center justify-center p-4 border-b border-gray-700">
        <img src={logo} alt="CNC Logo" className="h-10 mr-2" />
        <h1 className="text-lg font-semibold">CNC Admin</h1>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center p-4 border-b border-gray-700">
        {/* Avatar with initials */}
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#fea116ff] text-[#001524ff] text-2xl font-bold">
          {admin.firstName && admin.lastName
            ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
            : 'A'}
        </div>
        <h2 className="mt-2 font-semibold">
          {admin.firstName && admin.lastName 
            ? `${admin.firstName} ${admin.lastName}`
            : "Admin"}
        </h2>
        <p className="text-sm text-gray-300">{admin.role}</p>
        {admin.email && (
          <p className="text-xs text-gray-400 mt-1">{admin.email}</p>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <div key={item.path} className="relative">
            <Link
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-[#0098c9ff] transition-colors relative ${
                location.pathname === item.path
                  ? "bg-[#0084b3ff] text-white"
                  : "text-gray-300"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3">{item.label}</span>
              {item.badge > 0 && (
                <span 
                  className="absolute right-4 top-1/2 -mt-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 transform scale-100 transition-transform duration-200 ease-in-out animate-badge-pop"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          </div>
        ))}
      </nav>

      {/* Return to Home Page & Sign Out Buttons */}
      <div className="p-4 space-y-2 border-t border-gray-700">
        <Link 
          to="/" 
          className="w-full flex items-center justify-center bg-[#0098c9ff] hover:bg-[#0084b3ff] transition py-2 rounded-md"
        >
          <FaHome className="mr-2" /> Return to Home Page
        </Link>
        <button 
          onClick={handleSignOut} 
          className="flex items-center justify-center w-full py-2 transition bg-red-600 rounded-md hover:bg-red-700"
        >
          <FaSignOutAlt className="mr-2" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSideBar;
