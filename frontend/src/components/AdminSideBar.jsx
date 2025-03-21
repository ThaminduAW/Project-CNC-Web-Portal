import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { FaUser, FaUsers, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome, FaCalendarCheck } from "react-icons/fa";
=======
import { FaUser, FaUsers, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome, FaComments, FaBuilding } from "react-icons/fa";
>>>>>>> d59c6a3 (Backend: Add message routes for handling message-related API requests)
import logo from "../assets/logo.png"; // Ensure path is correct
import defaultProfile from "../assets/default-profile.png"; // Default profile image

const AdminSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState({ fullName: "Admin", role: "Admin", profilePhoto: defaultProfile });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "Admin") {
      setAdmin({
        fullName: user.fullName || "Admin",
        role: user.role || "Admin",
        profilePhoto: user.profilePhoto || defaultProfile,
      });
    } else {
      navigate("/signin"); // Redirect if not admin
    }
  }, [navigate]);

  // Reset badge when navigating to messages
  useEffect(() => {
    if (location.pathname === '/admin/messages') {
      setShowBadge(false);
    } else {
      setShowBadge(true);
    }
  }, [location.pathname]);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:3000/api/messages/unread", {
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
    // Poll for new messages every 30 seconds
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
    { path: "/admin/users", icon: FaUsers, label: "Users" },
    { path: "/admin/messages", icon: FaComments, label: "Messages", badge: showBadge && unreadCount },
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
        <img src={admin.profilePhoto} alt="Admin" className="h-16 w-16 rounded-full border border-gray-400" />
        <h2 className="mt-2 font-semibold">{admin.fullName}</h2>
        <p className="text-sm text-gray-300">{admin.role}</p>
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
<<<<<<< HEAD
          </li>
          <li>
            <Link to="/admin/partners" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaUsers className="mr-2" /> Partners
            </Link>
          </li>
          <li>
            <Link to="/admin/events" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaCalendarAlt className="mr-2" /> Reservations
            </Link>
          </li>
          <li>
            <Link to="/admin/reservations" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaCalendarCheck className="mr-2" /> Customer Reservations
            </Link>
          </li>
          <li>
            <Link to="/admin/messages" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaEnvelope className="mr-2" /> Messages
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaCog className="mr-2" /> Settings new
            </Link>
          </li>
        </ul>
=======
          </div>
        ))}
>>>>>>> d59c6a3 (Backend: Add message routes for handling message-related API requests)
      </nav>

      {/* Return to Home Page & Sign Out Buttons */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link 
          to="/" 
          className="w-full flex items-center justify-center bg-[#0098c9ff] hover:bg-[#0084b3ff] transition py-2 rounded-md"
        >
          <FaHome className="mr-2" /> Return to Home Page
        </Link>
        <button 
          onClick={handleSignOut} 
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition py-2 rounded-md"
        >
          <FaSignOutAlt className="mr-2" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSideBar;
