import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { baseURL } from "../../utils/baseURL";
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Unable to connect to the server. Please make sure the server is running.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      if (data.user.role === "Partner" && data.user.approved === false) {
        setError("Your account is pending admin approval. Please try again later.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "Partner") {
        navigate("/partner/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "An error occurred while signing in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0098c9ff] to-orange-300 relative overflow-hidden">
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
        className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-[#fea116ff] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <motion.img 
              src={logo} 
              alt="CNC Logo" 
              className="h-20 mb-6"
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
            className="text-3xl font-bold text-[#001524ff] mb-2"
          >
            Welcome Back!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[#333333ff] text-lg"
          >
            Sign in to your account
          </motion.p>
        </div>

        <AnimatePresence>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <motion.label 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="block text-sm font-semibold text-[#001524ff]"
            >
              Email Address
            </motion.label>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative group"
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'email' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                placeholder="Enter your email"
                required
              />
              <FaEnvelope className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'email' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.label 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="block text-sm font-semibold text-[#001524ff]"
            >
              Password
            </motion.label>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="relative group"
            >
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
                  ${focusedField === 'password' 
                    ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' 
                    : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
                placeholder="Enter your password"
                required
              />
              <FaLock className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
                ${focusedField === 'password' ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-sm"
            >
              <Link 
                to="/forgot-password" 
                className="font-medium text-[#fea116ff] hover:text-[#e69510ff] transition-colors group flex items-center"
              >
                Forgot your password?
                <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] text-white py-3 rounded-xl hover:from-[#0098c9ff] hover:to-[#fea116ff] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            {loading ? (
              <span className="flex items-center justify-center relative z-10">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center">
                Sign In
                <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </motion.button>
        </form>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-center mt-8 space-y-3"
        >
          <p className="text-sm text-[#001524ff]">
            Not a registered partner?{" "}
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-[#0098c9ff] font-semibold cursor-pointer hover:text-[#fea116ff] transition-colors inline-flex items-center"
              onClick={() => navigate("/signup")}
            >
              Sign Up
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

export default SignIn;
