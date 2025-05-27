import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from "../../components/Hero";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaUtensils, FaFish, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { baseURL } from "../../utils/baseURL";
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import defaultProfile from '../../assets/default-profile.png';

const Home = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 5,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${baseURL}/partners`);
        const data = await response.json();
        setRestaurants(data.slice(0, 4)); // Display top 4 restaurants
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch(`${baseURL}/tours`);
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    setExperiences(storedExperiences);
  }, []);

  useEffect(() => {
    // Fetch approved reviews
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${baseURL}/feedback/approved`);
        if (res.data.success) setReviews(res.data.data);
      } catch (err) {
        console.error('Error fetching approved reviews:', err);
        toast.error('Failed to load reviews');
      }
    };
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!feedback.name.trim()) {
      errors.name = 'Name is required';
    } else if (feedback.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!feedback.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (feedback.rating < 1 || feedback.rating > 5) {
      errors.rating = 'Please select a rating';
    }
    
    if (!feedback.message.trim()) {
      errors.message = 'Review message is required';
    } else if (feedback.message.trim().length < 10) {
      errors.message = 'Review must be at least 10 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await axios.post(`${baseURL}/feedback`, {
        ...feedback,
        category: 'experience' // Since this is in the reviews section, we'll set it to experience
      });
      
      if (response.data.success) {
        toast.success('Thank you for your review! It will be reviewed before being published.');
        setFeedback({
          name: '',
          email: '',
          rating: 5,
          message: ''
        });
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating input for form
  const handleStarClick = (star) => {
    setFeedback(prev => ({ ...prev, rating: star }));
  };

  return (
    <div className="bg-gradient-to-r from-[#0098c9ff] to-[#001524ff] text-[#ffffff]">
      <Header />
      <Hero />

      {/* Featured Restaurants Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0098c9ff] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fea116ff] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4">Restaurants</h2>
              <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
              <p className="text-gray-100 text-lg">Explore our seafood restaurants.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative group"
                whileHover={{ y: -5 }}
              >
                <div className="relative w-full h-[300px] bg-gray-200">
                  {restaurant.restaurantPhoto ? (
                    <img 
                      src={getImageUrl(restaurant.restaurantPhoto)}
                      alt={restaurant.restaurantName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaUtensils className="text-6xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-3">{restaurant.restaurantName}</h3>
                      <p className="text-gray-100 mb-4 line-clamp-2 text-lg">{restaurant.about || 'Experience exceptional dining at its finest'}</p>
                      <div className="flex items-center text-base text-gray-200 mb-6">
                        <FaMapMarkerAlt className="mr-2 text-[#fea116ff]" />
                        <span>{restaurant.address}</span>
                      </div>
                      {restaurant.cuisine && (
                        <div className="mb-4">
                          <span className="inline-block bg-[#fea116ff]/20 text-[#fea116ff] px-3 py-1 rounded-full text-sm">
                            {restaurant.cuisine}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/restaurant-details/${restaurant._id}`)}
                        className="w-full bg-[#fea116ff] text-white py-3 rounded-lg hover:bg-[#e8920eff] transition-colors font-semibold flex items-center justify-center text-lg"
                      >
                        View Restaurant <FaUtensils className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View All Restaurants <FaUtensils className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="relative py-8 sm:py-12 md:py-16 bg-[#fdfcdcff]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Left Side - Experiences */}
            <div>
              <div className="text-left mb-8 sm:mb-10 md:mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[#001524ff]">
                    Experience the Adventure
                  </h2>
                  <div className="w-16 sm:w-20 md:w-24 h-1 bg-[#fea116ff] mb-3 sm:mb-4"></div>
                  <p className="text-gray-700 text-base sm:text-lg">Discover the thrill of fishing and cooking your own seafood.</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Experience Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-w-4 aspect-h-3">
                    <img 
                      src="https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2VhZm9vZHxlbnwwfDB8MHx8fDA%3D"
                      alt="Deep Sea Fishing"
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Side - About Us */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:pl-6 xl:pl-12 mt-8 lg:mt-0"
            >
              <div className="text-[#fea116ff] text-base sm:text-lg font-semibold mb-2">About Us</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-[#001524ff]">
                Welcome to <span className="text-[#fea116ff] flex items-center">Catch & Cook <FaUtensils className="ml-1 sm:ml-2" /></span>
              </h2>
              <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                At Catch and Cook World Tour, we are driven by a passion for authentic culinary experiences and a profound love for the sea. Our journey is spearheaded by our visionary founder, Kim, whose deep-rooted connection to seafood spans two decades. With unparalleled expertise in catching and cooking seafood, Kim has embarked on a mission to share the unparalleled joy of harvesting and savoring the ocean's bounty.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-[#fea116ff] font-bold">15</div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Years of</div>
                    <div className="text-gray-600 text-xs sm:text-sm">EXPERIENCE</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-[#fea116ff] font-bold">50</div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Popular</div>
                    <div className="text-gray-600 text-xs sm:text-sm">RESTAURANTS</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/about')}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold bg-[#fea116ff] text-white hover:bg-[#e8920eff] transition-colors duration-300"
              >
                READ MORE
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-[#0098c9ff] to-[#001524ff] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose CNC World Tour?</h2>
            <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
            <p className="text-lg text-gray-100">Your ultimate seafood adventure starts here.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-xl font-bold mb-3">Thrilling Fishing Tours</h3>
              <p className="text-gray-100">Catch your own seafood and experience deep-sea fishing like never before.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🍽</div>
              <h3 className="text-xl font-bold mb-3">Cook Like a Chef</h3>
              <p className="text-gray-100">Learn professional seafood preparation from world-class chefs.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">Sustainable Practices</h3>
              <p className="text-gray-100">We prioritize eco-friendly fishing methods to protect marine life.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 px-6 md:px-12 relative overflow-hidden bg-[#fdfcdcff]">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#fea116ff] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-[#001524ff]">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Real experiences from seafood lovers worldwide.</p>
          </motion.div>

          <div className="grid gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3 lg:divide-x">
            {reviews.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 italic p-8 bg-white/50 rounded-xl">
                No approved reviews yet. Be the first to share your experience!
              </div>
            ) : (
              reviews.slice(0, 3).map((review, idx) => (
                <motion.div
                  key={review._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center gap-4 sm:px-4 md:gap-6 lg:px-8"
                >
                  <div className="text-center text-gray-600">"{review.message}"</div>
                  
                  <div className="flex flex-col items-center gap-2 sm:flex-row md:gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-[#fea116ff]/10 shadow-lg md:h-14 md:w-14 flex items-center justify-center">
                      <span className="text-[#fea116ff] text-xl font-bold">{review.name.charAt(0)}</span>
                    </div>
                    
                    <div>
                      <div className="text-center text-sm font-bold text-[#001524ff] sm:text-left md:text-base">
                        {review.name}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-sm ${i < review.rating ? 'text-[#fea116ff]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-center text-sm text-gray-500 sm:text-left md:text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/reviews')}
              className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View All Reviews <FaStar className="ml-2" />
            </button>
          </motion.div>

          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 max-w-4xl mx-auto"
          >
            {/* Success Message */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Thank you! Your review has been submitted successfully and will be reviewed before publication.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form Header */}
            <div className="flex flex-col sm:flex-row sm:items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fea116ff] to-[#e8920eff] flex items-center justify-center mr-0 sm:mr-4 mb-3 sm:mb-0 shadow-md">
                <FaStar className="text-white text-lg" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-[#001524ff] mb-1">Share Your Experience</h3>
                <p className="text-gray-600 text-sm">Your review helps others discover amazing seafood adventures!</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                                      <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={feedback.name}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 rounded-lg border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                        formErrors.name 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  {formErrors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.name}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                                      <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={feedback.email}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 rounded-lg border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                        formErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                  {formErrors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.email}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleStarClick(star)}
                        className="focus:outline-none transform hover:scale-110 transition-all duration-200 p-1 rounded-full hover:bg-[#fea116ff]/10"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        <FaStar className={`text-2xl ${star <= feedback.rating ? 'text-[#fea116ff]' : 'text-gray-300'} transition-colors duration-200`} />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {feedback.rating === 1 && "Poor"}
                    {feedback.rating === 2 && "Fair"}
                    {feedback.rating === 3 && "Good"}
                    {feedback.rating === 4 && "Very Good"}
                    {feedback.rating === 5 && "Excellent"}
                    {feedback.rating > 0 && ` (${feedback.rating}/5)`}
                  </div>
                </div>
                {formErrors.rating && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.rating}
                  </motion.p>
                )}
              </div>

              {/* Review Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={feedback.message}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 rounded-lg border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 resize-none ${
                    formErrors.message 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                  }`}
                  placeholder="Tell us about your experience... What did you enjoy most? How was the service? Would you recommend us to others?"
                />
                <div className="flex justify-between items-center mt-2">
                  {formErrors.message ? (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.message}
                    </motion.p>
                  ) : (
                    <div></div>
                  )}
                  <span className={`text-sm ${feedback.message.length < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feedback.message.length}/500
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#fea116ff] to-[#e8920eff] hover:from-[#e8920eff] hover:to-[#d4810eff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fea116ff] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Your Review...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="pt-1">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By submitting this review, you agree that your feedback may be published on our website after moderation. 
                  We respect your privacy and will not share your email address publicly.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Call-To-Action Section */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-[#fea116ff] to-[#e8920eff] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-[#001524ff] mb-4">Join the Ultimate Seafood Adventure</h2>
            <p className="text-[#001524ff] text-lg mb-8">Book your experience now and create unforgettable memories.</p>
            <a 
              href="/reservation" 
              className="inline-block bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105"
            >
              Book a Reservation
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
