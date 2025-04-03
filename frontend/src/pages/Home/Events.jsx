import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStore } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewMenu = (eventId) => {
    navigate(`/menu/${eventId}`);
  };

  if (loading) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">
            Discover <span className="text-[#fea116ff]">Upcoming Menus</span>
          </h1>
          <p className="text-center text-gray-600 text-lg mt-3">
            Experience the thrill of culinary adventures and unforgettable moments with our partner restaurants.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={`http://localhost:3000${event.image}`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-3 py-1 rounded-full">
                  ${event.price}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#001524ff] mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaStore className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    {event.partner.restaurantName}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    From: {new Date(event.availableFrom).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaClock className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    To: {new Date(event.availableTo).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    {event.location}
                  </div>
                </div>

                <button 
                  onClick={() => handleViewMenu(event._id)}
                  className="mt-6 w-full bg-[#fea116ff] text-white py-2 px-4 rounded-md hover:bg-[#e89115ff] transition duration-300"
                >
                  View Menu
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events; 