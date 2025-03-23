import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome, FaUtensils, FaBars } from "react-icons/fa";
import logo from "../assets/logo.png";
import defaultProfile from "../assets/default-profile.png";

const PartnerSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [partner, setPartner] = useState({ 
    fullName: "Partner", 
    role: "Partner", 
    profilePhoto: defaultProfile,
    restaurantName: "Restaurant"
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
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
  }, [navigate]);

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

  const isActive = (path) => {
    return location.pathname === path ? "bg-[#15314B] text-white" : "text-gray-300 hover:bg-[#15314B] hover:text-white";
  };

  const menuItems = [
    { path: "/partner/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/partner/menu", icon: FaUtensils, label: "Menu" },
    { path: "/partner/events", icon: FaCalendarAlt, label: "Events" },
    { path: "/partner/messages", icon: FaEnvelope, label: "Messages", badge: showBadge && unreadCount },
    { path: "/partner/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className={`h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#2C3E50] to-[#3498DB] text-white flex flex-col shadow-xl transition-all duration-300`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-4 bg-[#3498DB] p-2 rounded-full shadow-lg hover:bg-[#2980B9] transition-colors"
      >
        <FaBars />
      </button>

      {/* Logo & Name */}
      <div className="flex items-center p-6 border-b border-[#ffffff33]">
        <img src={logo} alt="CNC Logo" className="h-10" />
        {!isCollapsed && <h1 className="text-xl font-bold ml-3">Partner Hub</h1>}
      </div>

      {/* Profile Section */}
      <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center p-6 border-b border-[#ffffff33]`}>
        <img 
          src={partner.profilePhoto} 
          alt="Partner" 
          className={`${isCollapsed ? 'h-12 w-12' : 'h-16 w-16'} rounded-full border-2 border-white shadow-lg`} 
        />
        {!isCollapsed && (
          <div className="ml-4">
            <h2 className="font-bold text-lg">{partner.fullName}</h2>
            <p className="text-sm text-[#E0E0E0]">{partner.restaurantName}</p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path} className="relative">
              <Link 
                to={item.path} 
                className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffffff22] transition-colors ${isActive(item.path)}`}
              >
                <item.icon className={`${isCollapsed ? 'text-xl' : ''}`} />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
                {item.badge > 0 && (
                  <span 
                    className="absolute right-0 top-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 transform scale-100 transition-transform duration-200 ease-in-out animate-badge-pop"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <Link 
          to="/" 
          className={`flex items-center justify-center px-4 py-2 rounded-lg bg-[#ffffff22] hover:bg-[#ffffff33] transition-colors ${isActive('/')}`}
        >
          <FaHome className={`${isCollapsed ? 'text-xl' : ''}`} />
          {!isCollapsed && <span className="ml-2">Home</span>}
        </Link>
        <button 
          onClick={handleSignOut} 
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg bg-[#E74C3C] hover:bg-[#C0392B] transition-colors ${isActive('/signout')}`}
        >
          <FaSignOutAlt className={`${isCollapsed ? 'text-xl' : ''}`} />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default PartnerSideBar; 