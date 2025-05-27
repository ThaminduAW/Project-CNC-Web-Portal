import { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaUser, FaComments } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { baseURL } from "../../utils/baseURL";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ success: false, error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
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
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
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
    
    setStatus({ success: false, error: "" });
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseURL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message. Please try again.");
      }

      setStatus({ success: true, error: "" });
      setFormData({ name: "", email: "", message: "" });
      setShowSuccessMessage(true);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ success: false, error: "" });
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setStatus({ 
        success: false, 
        error: err.message || "Failed to send message. Please try again later." 
      });
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
            Get in Touch with <span className="text-[#fea116ff]">CNC World Tour</span>
          </h1>
          <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions about our tours, want to make a reservation, or just want to say hello.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fea116ff] to-[#e8920eff] flex items-center justify-center mr-4 shadow-lg">
                <FaComments className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#001524ff]">Contact Information</h2>
                <p className="text-gray-600 text-sm">Get in touch with us anytime</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#fea116ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <FaMapMarkerAlt className="text-[#fea116ff] text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#001524ff] mb-1">Our Location</h3>
                  <p className="text-gray-600 leading-relaxed">
                    IIBIT - Federation University Australia<br />
                    Adelaide Campus<br />
                    6/127 Rundle Mall, Adelaide SA 5000
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#fea116ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <FaEnvelope className="text-[#fea116ff] text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#001524ff] mb-1">Email Us</h3>
                  <p className="text-gray-600">contact@cncworldtour.com</p>
                  <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#fea116ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <FaPhone className="text-[#fea116ff] text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#001524ff] mb-1">Call Us</h3>
                  <p className="text-gray-600">+1 234 567 890</p>
                  <p className="text-sm text-gray-500 mt-1">Mon-Fri: 9AM-6PM ACST</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#fea116ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <FaClock className="text-[#fea116ff] text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#001524ff] mb-1">Business Hours</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Send Message Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fea116ff] to-[#e8920eff] flex items-center justify-center mr-4 shadow-lg">
                <FaPaperPlane className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#001524ff]">Send Us a Message</h2>
                <p className="text-gray-600 text-sm">We'd love to hear from you</p>
              </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Message sent successfully! We'll get back to you within 24 hours.
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
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{status.error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaComments className="inline mr-2 text-[#fea116ff]" />
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="5"
                  placeholder="Tell us about your inquiry, questions about our tours, or how we can help you..."
                  className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-0 resize-none ${
                    formErrors.message 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-[#fea116ff] hover:border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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
                  <span className={`text-sm ${formData.message.length < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formData.message.length}/1000
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#fea116ff] to-[#e8920eff] hover:from-[#e8920eff] hover:to-[#d4810eff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fea116ff] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Your Message...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Message
                  </>
                )}
              </button>

              {/* Privacy Notice */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By sending this message, you agree to our privacy policy. We'll only use your information to respond to your inquiry.
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Google Maps Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#001524ff] mb-4">Find Us Here</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Visit us at our campus in Adelaide or explore our seafood destinations around the world.
            </p>
          </div>
          <div className="w-full h-64 md:h-96 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <iframe
              title="CNC Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              className="rounded-2xl"
              src="https://maps.google.com/maps?q=IIBIT%20Federation%20University%20Australia,%206/127%20Rundle%20Mall,%20Adelaide%20SA%205000&t=&z=15&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
