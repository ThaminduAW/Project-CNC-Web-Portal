import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Update path if needed

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-[#0098c9ff] text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="CNC Logo" className="h-10" />
          <span className="ml-2 text-lg font-semibold">CNC World Tour</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-[#fea116ff] transition">Home</Link>
          <Link to="/restaurants" className="hover:text-[#fea116ff] transition">Restaurants</Link>
          <Link to="/events" className="hover:text-[#fea116ff] transition">Events</Link>
<<<<<<< HEAD
          <Link to="/reservation" className="hover:text-[#fea116ff] transition">Reservation</Link>
          <Link to="/offers" className="hover:text-[#fea116ff] transition">Offers</Link> {/* New Offers Link */}
=======
          <Link to="/offers" className="hover:text-[#fea116ff] transition">Offers</Link>
          <Link to="/reservation" className="hover:text-[#fea116ff] transition">Reservation</Link>
>>>>>>> 3fa87aa2cbf3e92c93b003a26172069347c0b4e0
          <Link to="/about" className="hover:text-[#fea116ff] transition">About</Link>
          <Link to="/contact" className="hover:text-[#fea116ff] transition">Contact</Link>
        </nav>

<<<<<<< HEAD

=======
>>>>>>> 3fa87aa2cbf3e92c93b003a26172069347c0b4e0
        {/* Sign In Button */}
        <button 
          className="hidden md:block bg-[#fea116ff] text-[#001524ff] px-4 py-2 rounded-md hover:bg-[#e69510ff] transition"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none"
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

<<<<<<< HEAD
     {/* Mobile Dropdown Menu */}
     {isOpen && (
=======
      {/* Mobile Dropdown Menu */}
      {isOpen && (
>>>>>>> 3fa87aa2cbf3e92c93b003a26172069347c0b4e0
        <nav className="md:hidden bg-[#0098c9ff] text-white flex flex-col items-center space-y-4 py-4">
          <Link to="/" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/restaurants" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Restaurants</Link>
          <Link to="/events" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Events</Link>
<<<<<<< HEAD
          <Link to="/reservation" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Reservation</Link>
          <Link to="/offers" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Offers</Link> {/* New Offers Link */}
=======
          <Link to="/offers" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Offers</Link>
          <Link to="/reservation" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Reservation</Link>
>>>>>>> 3fa87aa2cbf3e92c93b003a26172069347c0b4e0
          <Link to="/about" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" className="hover:text-[#fea116ff]" onClick={() => setIsOpen(false)}>Contact</Link>
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate("/signin");
            }} 
            className="bg-[#fea116ff] text-[#001524ff] px-4 py-2 rounded-md hover:bg-[#e69510ff] transition"
          >
            Sign In
          </button>
        </nav>
      )}
    </header>
  );
};

<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> 3fa87aa2cbf3e92c93b003a26172069347c0b4e0
