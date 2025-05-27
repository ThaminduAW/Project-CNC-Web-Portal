import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { baseURL } from "../../utils/baseURL";
import { FaUser, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLink, FaLock, FaArrowRight } from 'react-icons/fa';
import Autocomplete from "react-google-autocomplete";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    url: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("❌ Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    if (!validateUrl(formData.url)) {
      setError("❌ Please enter a valid URL (e.g., https://www.example.com)");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage("✅ Your registration is pending admin approval. You will be notified once approved.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0098c9ff] to-orange-300 relative overflow-hidden py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-[#0098c9ff] rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#fea116ff] rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#001524ff] rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl mx-4 border border-[#fea116ff] relative z-10 overflow-y-auto"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <motion.img 
              src={logo} 
              alt="CNC Logo" 
              className="h-16 md:h-20 mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.div 
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] opacity-0 group-hover:opacity-20 blur-xl"
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-[#001524ff] mb-2"
          >
            CNC World Tour
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[#333333ff] text-base md:text-lg"
          >
            Register as a partner
          </motion.p>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 overflow-hidden"
            >
              {message}
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'fullName' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaUser className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'fullName' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                name="restaurantName"
                placeholder="Enter restaurant name"
                onFocus={() => setFocusedField('restaurantName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'restaurantName' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaBuilding className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'restaurantName' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Autocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place) => {
                  setFormData(prev => ({
                    ...prev,
                    address: place.formatted_address
                  }));
                }}
                options={{
                  types: ['address'],
                  componentRestrictions: { country: 'au' }
                }}
                placeholder="Enter restaurant address"
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'address' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                required
              />
              <FaMapMarkerAlt className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'address' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'phone' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaPhone className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'phone' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'email' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaEnvelope className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'email' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Restaurant URL <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="url"
                name="url"
                placeholder="https://www.example.com"
                onFocus={() => setFocusedField('url')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'url' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaLink className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'url' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'password' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaLock className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'password' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-2 p-3 bg-[#fdfcdcff]/50 backdrop-blur-sm rounded-lg border border-[#fea116ff]/20"
            >
              <p className="text-xs font-medium text-[#001524ff] mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside text-xs text-[#001524ff] space-y-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="space-y-2"
          >
            <label className="block text-sm font-semibold text-[#001524ff]">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'confirmPassword' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                onChange={handleChange}
                required
              />
              <FaLock className={`absolute left-4 top-2.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'confirmPassword' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </div>
          </motion.div>
        </form>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] text-white py-3 rounded-xl hover:from-[#0098c9ff] hover:to-[#fea116ff] transition-all duration-200 shadow-lg mt-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          <span className="relative z-10 flex items-center justify-center">
            Sign Up
            <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-sm text-[#001524ff]">
            Already have an account?{" "}
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-[#0098c9ff] font-semibold cursor-pointer hover:text-[#fea116ff] transition-colors inline-flex items-center"
              onClick={() => navigate("/signin")}
            >
              Sign In
              <FaArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </p>
          <motion.p 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-[#001524ff] cursor-pointer hover:text-[#0098c9ff] transition-colors inline-flex items-center"
            onClick={() => navigate("/")}
          >
            Return to home
            <FaArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
