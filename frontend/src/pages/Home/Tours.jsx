import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tours');
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
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
          {tours.map((tour) => (
            <motion.div
              key={tour._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={getImageUrl(tour.image)}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-3 py-1 rounded-full">
                  ${tour.price}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#001524ff] mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4">{tour.briefDescription}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaClock className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    Duration: {tour.timeDuration}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaStore className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    {tour.partner?.restaurantName || 'Restaurant name not available'}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    Date: {new Date(tour.date).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="w-5 h-5 mr-2 text-[#fea116ff]" />
                    {tour.location}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Link 
                    to={`/tours/${tour._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tours; 