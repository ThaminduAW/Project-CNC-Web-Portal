import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  // Function to scroll to top of page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-[#001524ff] text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About CNC */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-2xl font-bold text-[#fea116ff]">CNC World Tour</h2>
          <p className="text-sm text-gray-400 mt-2">
            Explore the world's best seafood restaurants, book your next culinary adventure, and experience the finest ocean flavors.
          </p>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-[#fea116ff] transition text-lg">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#fea116ff] transition text-lg">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#fea116ff] transition text-lg">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#fea116ff] transition text-lg">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-3 text-[#fea116ff]">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" onClick={scrollToTop} className="hover:text-[#fea116ff] transition duration-300">🏠 Home</Link></li>
            <li><Link to="/events" onClick={scrollToTop} className="hover:text-[#fea116ff] transition duration-300">🍽 Menu</Link></li>
            <li><Link to="/reservation" onClick={scrollToTop} className="hover:text-[#fea116ff] transition duration-300">📅 Reservation</Link></li>
            <li><Link to="/about" onClick={scrollToTop} className="hover:text-[#fea116ff] transition duration-300">ℹ️ About</Link></li>
            <li><Link to="/contact" onClick={scrollToTop} className="hover:text-[#fea116ff] transition duration-300">📞 Contact</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-3 text-[#fea116ff]">Contact Us</h3>
          <p className="text-sm text-gray-400">📍 123 Ocean Street, Seafood City</p>
          <p className="text-sm text-gray-400">📧 contact@cncworldtour.com</p>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="border-t border-gray-600 mt-10 mb-6 w-3/4 mx-auto opacity-50"></div>

      {/* Copyright & Project Team */}
      <div className="text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} CNC World Tour. All rights reserved.</p>
        <p className="mt-2 text-gray-300">
          Project by: <span className="text-[#fea116ff] font-semibold">Thamindu, Bipin, Suyog, Kawindu & Rusha</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
