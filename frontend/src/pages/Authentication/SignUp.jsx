import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion } from "framer-motion";
import { baseURL } from "../../utils/baseURL";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfcdcff] to-[#ffffff] py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-3xl shadow-2xl mx-4 border border-[#fdfcdcff] overflow-y-auto"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.img 
            src={logo} 
            alt="CNC Logo" 
            className="h-16 md:h-20 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <h2 className="text-2xl md:text-3xl font-bold text-[#001524ff] mb-2">CNC World Tour</h2>
          <p className="text-[#333333ff] text-base md:text-lg">Register as a partner</p>
        </div>


        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6"
          >
            {message}
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="restaurantName"
                placeholder="Enter restaurant name"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                placeholder="Enter restaurant address"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Restaurant URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                name="url"
                placeholder="https://www.example.com"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="mt-2 p-3 bg-[#fdfcdcff] rounded-lg">
              <p className="text-xs font-medium text-[#333333ff] mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside text-xs text-[#333333ff] space-y-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-4 py-2.5 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                onChange={handleChange}
                required
              />
              <svg className="absolute left-4 top-2.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </form>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#fea116ff] to-[#e69510ff] text-white py-2.5 rounded-xl hover:from-[#e69510ff] hover:to-[#fea116ff] transition-all duration-200 shadow-lg mt-6"
        >
          Sign Up
        </motion.button>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-[#333333ff]">
            Already have an account?{" "}
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-[#0098c9ff] font-semibold cursor-pointer hover:text-[#0087b8ff] transition-colors"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </motion.span>
          </p>
          <motion.p 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-[#333333ff] cursor-pointer hover:text-[#001524ff] transition-colors"
            onClick={() => navigate("/")}
          >
            Return to home
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
