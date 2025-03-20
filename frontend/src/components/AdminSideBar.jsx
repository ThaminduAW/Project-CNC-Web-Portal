import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUser, FaUsers, FaCalendarAlt, FaEnvelope, FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";
import logo from "../assets/logo.png"; // Ensure path is correct
import defaultProfile from "../assets/default-profile.png"; // Default profile image

const AdminSideBar = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({ fullName: "Admin", role: "Admin", profilePhoto: defaultProfile });

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

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

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
        <ul className="space-y-2">
          <li>
            <Link to="/admin/dashboard" className="flex items-center px-6 py-2 hover:bg-[#0098c9ff] transition">
              <FaUser className="mr-2" /> Admin Dashboard
            </Link>
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
