import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from "./Header";
import Footer from "./Footer";
import { FaUtensils, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/events/${id}`);
        const data = await response.json();
        setMenuItem(data);
      } catch (error) {
        console.error("Error fetching menu item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex items-center justify-center">
        <div className="text-2xl text-[#001524ff]">Loading...</div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff] flex items-center justify-center">
        <div className="text-2xl text-[#001524ff]">Menu item not found</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
      <Header />
      
      <div className="container mx-auto px-6 md:px-12 py-12 max-w-7xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-[#001524ff] mb-8 hover:text-[#fea116ff] transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Menu
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-xl overflow-hidden shadow-xl md:col-span-2 aspect-[4/3]"
          >
            {menuItem.image && (
              <img
                src={`http://localhost:3000${menuItem.image}`}
                alt={menuItem.title}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center md:col-span-1"
          >
            <h1 className="text-4xl font-bold mb-4">{menuItem.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <FaMapMarkerAlt className="mr-2 text-[#fea116ff]" />
              <span>{menuItem.partner?.restaurantName || 'Unknown Restaurant'}</span>
            </div>

            <div className="text-3xl font-bold text-[#fea116ff] mb-6">
              ${menuItem.price}
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {menuItem.description}
              </p>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {menuItem.ingredients || 'No ingredients listed'}
              </p>
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Preparation Method</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {menuItem.preparationMethod || 'No preparation method listed'}
              </p>
            </div>

            <button
              onClick={() => navigate('/reservation')}
              className="w-full bg-[#fea116ff] text-white py-4 rounded-lg text-lg font-semibold hover:bg-[#e8920eff] transition-colors flex items-center justify-center"
            >
              Book Now <FaUtensils className="ml-2" />
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MenuDetail; 