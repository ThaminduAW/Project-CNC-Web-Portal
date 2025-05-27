import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaUsers, FaUtensils, FaCalendarAlt, FaClock, FaComments, FaCheckCircle } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AvailabilityViewer from "../../components/AvailabilityViewer";
import { baseURL } from "../../utils/baseURL";  

const Reservation = () => {
  const [restaurants, setRestaurants] = useState([]); // Stores fetched restaurants
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    restaurant: "",
    date: "",
    instructions: "",
    guestCount: "1", // Add default guest count
    subscribeToPromotions: false // Add subscription field
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [status, setStatus] = useState({ success: false, error: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch restaurant (partner) list from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${baseURL}/partners`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Restaurants:", data);

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        // Filter out any invalid restaurant objects
        const validRestaurants = data.filter(restaurant => 
          restaurant && 
          restaurant._id && 
          restaurant.restaurantName
        );

        if (validRestaurants.length === 0) {
          throw new Error("No valid restaurants found");
        }

        setRestaurants(validRestaurants);
      } catch (err) {
        console.error("Error fetching restaurants:", err.message);
        setStatus({ success: false, error: "Failed to load restaurants. Please try again later." });
        setRestaurants([]);
      }
    };

    fetchRestaurants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Reset time slot when date or restaurant changes
    if (name === 'date' || name === 'restaurant') {
      setSelectedTimeSlot(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.contact)) {
      errors.contact = 'Please enter a valid contact number';
    }
    
    if (!formData.restaurant) {
      errors.restaurant = 'Please select a restaurant';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    if (!formData.guestCount || formData.guestCount < 1) {
      errors.guestCount = 'Please specify number of guests';
    }
    
    if (!selectedTimeSlot) {
      errors.timeSlot = 'Please select an available time slot';
    }
    
    return errors;
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setStatus({ success: false, error: "" });
    setFormErrors({});
    setIsSubmitting(true);

    // Find the selected restaurant object
    const selectedRestaurant = restaurants.find(r => r._id === formData.restaurant);
    console.log("Selected Restaurant:", selectedRestaurant);
    console.log("All Restaurants:", restaurants);
    console.log("Form Restaurant ID:", formData.restaurant);

    if (!selectedRestaurant) {
      setStatus({ success: false, error: "Invalid restaurant selection" });
      return;
    }

    const reservationData = {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
      restaurant: selectedRestaurant._id,
      date: formData.date,
      timeSlot: {
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime
      },
      instructions: formData.instructions || '',
      guestCount: parseInt(formData.guestCount),
      subscribeToPromotions: formData.subscribeToPromotions
    };

    console.log("Sending reservation data:", reservationData);

    try {
      const response = await fetch(`${baseURL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to make reservation");
      }

      setStatus({ success: true, error: "" });
      setShowSuccessMessage(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        contact: "",
        restaurant: "",
        date: "",
        instructions: "",
        guestCount: "1",
        subscribeToPromotions: false
      });
      setSelectedTimeSlot(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ success: false, error: "" });
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err) {
      console.error("Reservation error:", err);
      setStatus({ success: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />

      <div className="container mx-auto px-6 md:px-12 py-12 max-w-6xl pt-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Make a <span className="text-[#fea116ff]">Reservation</span>
          </h1>
          <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
            Book your spot at one of our partner restaurants and experience the finest seafood adventures with us.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto"
        >
          {/* Form Header */}
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fea116ff] to-[#e8920eff] flex items-center justify-center mr-6 shadow-lg">
              <FaUtensils className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#001524ff] mb-2">Reserve Your Table</h2>
              <p className="text-gray-600 text-base">Secure your dining experience in just a few steps</p>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-green-800">Reservation Confirmed!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your table has been reserved successfully. Check your email for confirmation details and any special instructions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Error Message */}
          {status.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-red-800">Reservation Error</h3>
                  <p className="text-sm text-red-700 mt-1">{status.error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#001524ff] border-b border-gray-200 pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-[#fea116ff]" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.name 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
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

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-[#fea116ff]" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
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

                {/* Contact Field */}
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-[#fea116ff]" />
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    id="contact"
                    placeholder="+1 234 567 8900"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.contact 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.contact && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.contact}
                    </motion.p>
                  )}
                </div>

                {/* Guest Count Field */}
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUsers className="inline mr-2 text-[#fea116ff]" />
                    Number of Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="guestCount"
                    id="guestCount"
                    min="1"
                    max="20"
                    placeholder="How many guests?"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.guestCount 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.guestCount}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.guestCount && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.guestCount}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Reservation Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#001524ff] border-b border-gray-200 pb-2">Reservation Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Selection */}
                <div>
                  <label htmlFor="restaurant" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUtensils className="inline mr-2 text-[#fea116ff]" />
                    Select Restaurant <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="restaurant"
                    id="restaurant"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.restaurant 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.restaurant}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a restaurant...</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.restaurantName}
                      </option>
                    ))}
                  </select>
                  {formErrors.restaurant && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.restaurant}
                    </motion.p>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2 text-[#fea116ff]" />
                    Reservation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 ${
                      formErrors.date 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.date && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.date}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            {formData.restaurant && formData.date && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#001524ff] border-b border-gray-200 pb-2 flex items-center">
                  <FaClock className="mr-2 text-[#fea116ff]" />
                  Available Time Slots
                </h3>
                <AvailabilityViewer
                  restaurantId={formData.restaurant}
                  date={formData.date}
                  onTimeSlotSelect={handleTimeSlotSelect}
                />
                {formErrors.timeSlot && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.timeSlot}
                  </motion.p>
                )}
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-semibold text-gray-700 mb-2">
                <FaComments className="inline mr-2 text-[#fea116ff]" />
                Special Instructions (Optional)
              </label>
              <textarea
                name="instructions"
                id="instructions"
                rows="4"
                placeholder="Any dietary restrictions, special occasions, seating preferences, or other requests..."
                className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 resize-none border-gray-200 focus:border-[#fea116ff] hover:border-gray-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={formData.instructions}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="mt-2 text-sm text-gray-500">
                Let us know about any special requirements to make your dining experience perfect.
              </p>
            </div>

            {/* Subscription Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="subscribeToPromotions"
                name="subscribeToPromotions"
                checked={formData.subscribeToPromotions}
                onChange={(e) => setFormData(prev => ({ ...prev, subscribeToPromotions: e.target.checked }))}
                className="w-5 h-5 text-[#fea116ff] border-gray-300 rounded focus:ring-[#fea116ff] mt-0.5"
                disabled={isSubmitting}
              />
              <div>
                <label htmlFor="subscribeToPromotions" className="text-sm font-medium text-gray-700">
                  Subscribe to promotional updates
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Receive special offers, new menu items, and exclusive events from this restaurant.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedTimeSlot}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#fea116ff] to-[#e8920eff] hover:from-[#e8920eff] hover:to-[#d4810eff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fea116ff] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  (isSubmitting || !selectedTimeSlot) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Reservation...
                  </>
                ) : selectedTimeSlot ? (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Confirm Reservation
                  </>
                ) : (
                  <>
                    <FaClock className="mr-2" />
                    Select a Time Slot to Continue
                  </>
                )}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By making this reservation, you agree to our terms of service. We'll send confirmation details to your email address.
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Reservation;
