import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome, FaUtensils, FaComments, FaCalendarCheck, FaClipboardList } from "react-icons/fa";
import logo from "../assets/logo.png";
import defaultProfile from "../assets/default-profile.png";
import { baseURL } from '../utils/baseURL';

const PartnerSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [partner, setPartner] = useState({ 
    fullName: "Partner", 
    role: "Partner", 
    profilePhoto: defaultProfile,
    restaurantName: "Restaurant"
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(true);

  // Function to update partner details from localStorage
  const updatePartnerDetails = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "Partner") {
      setPartner({
        fullName: user.fullName || "Partner",
        role: user.role || "Partner",
        profilePhoto: user.profilePhoto || defaultProfile,
        restaurantName: user.restaurantName || "Restaurant"
      });
    } else {
      navigate("/signin");
    }
  };

  // Initial load and setup storage event listener
  useEffect(() => {
    updatePartnerDetails();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        updatePartnerDetails();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // Also update when location changes (in case settings page updates localStorage)
  useEffect(() => {
    updatePartnerDetails();
  }, [location]);

  // Reset badge when navigating to messages
  useEffect(() => {
    if (location.pathname === '/partner/messages') {
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
    { path: "/partner/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/partner/events", icon: FaUtensils, label: "Events" },
    { path: "/partner/reservations", icon: FaCalendarCheck, label: "Reservations" },
    { path: "/partner/menu", icon: FaClipboardList, label: "Menu Management" },
    { path: "/partner/messages", icon: FaComments, label: "Messages", badge: showBadge && unreadCount },
    { path: "/partner/notifications", icon: FaEnvelope, label: "Promotions" },
    { path: "/partner/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className="h-screen w-64 bg-[#001524ff] text-white flex flex-col overflow-hidden sticky top-0">
      {/* Logo & Name */}
      <div className="flex items-center justify-center p-4 border-b border-gray-700">
        <img src={logo} alt="CNC Logo" className="h-10 mr-2" />
        <h1 className="text-lg font-semibold">Partner Hub</h1>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center p-4 border-b border-gray-700">
        <img src={partner.profilePhoto} alt="Partner" className="w-16 h-16 border border-gray-400 rounded-full" />
        <h2 className="mt-2 font-semibold">{partner.fullName}</h2>
        <p className="text-sm text-gray-300">{partner.restaurantName}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
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

export default PartnerSideBar; 