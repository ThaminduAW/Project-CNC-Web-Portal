import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Update path if needed

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gradient-to-r from-[#0098c9ff]/90 to-[#001524ff]/90 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-[#0098c9ff] to-[#001524ff]'
    }`}>
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src={logo} alt="CNC Logo" className="h-10 transition-transform duration-300 group-hover:scale-110" />
          <span className="ml-2 text-lg font-bold bg-gradient-to-r from-white to-[#fea116ff] bg-clip-text text-transparent">
            CNC World Tour
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {['Home', 'Tours', 'Reservation', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="relative text-white hover:text-[#fea116ff] transition-colors duration-300 group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#fea116ff] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Sign In Button */}
        <button 
          className="hidden md:block relative overflow-hidden group bg-gradient-to-r from-[#fea116ff] to-[#ff8c00] text-[#001524ff] px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#fea116ff]/30"
          onClick={() => navigate("/signin")}
        >
          <span className="relative z-10">Sign In</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c00] to-[#fea116ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none text-white hover:text-[#fea116ff] transition-colors duration-300"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gradient-to-b from-[#0098c9ff]/95 to-[#001524ff]/95 backdrop-blur-md text-white flex flex-col items-center space-y-4 py-4 animate-fadeIn">
          {['Home', 'Tours', 'Reservation', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="hover:text-[#fea116ff] transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate("/signin");
            }} 
            className="bg-gradient-to-r from-[#fea116ff] to-[#ff8c00] text-[#001524ff] px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-[#fea116ff]/30 transition-all duration-300"
          >
            Sign In
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;