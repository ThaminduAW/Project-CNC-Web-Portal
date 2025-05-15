import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaArrowRight, FaKey } from 'react-icons/fa';
import { baseURL } from "../../utils/baseURL";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setSuccess("OTP has been sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "An error occurred while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/auth/verify-otp-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      setSuccess("Password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError(err.message || "An error occurred while verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form className="space-y-6" onSubmit={handleSendOTP}>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-2 overflow-hidden"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-2 overflow-hidden"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
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
          id="email"
          name="email"
          type="email"
          required
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
            ${email ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FaEnvelope className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
          ${email ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
        />
      </motion.div>
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
            Sending OTP...
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center">
            Send OTP
            <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </motion.button>
    </form>
  );

  const renderStep2 = () => (
    <form className="space-y-6" onSubmit={handleVerifyOTP}>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-2 overflow-hidden"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-2 overflow-hidden"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-2">
        <motion.label 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="block text-sm font-semibold text-[#001524ff]"
        >
          OTP
        </motion.label>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative group"
        >
          <input
            id="otp"
            name="otp"
            type="text"
            required
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
              ${otp ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <FaKey className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
            ${otp ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
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
          New Password
        </motion.label>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative group"
        >
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
              ${newPassword ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FaLock className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
            ${newPassword ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
          />
        </motion.div>
      </div>
      <div className="space-y-2">
        <motion.label 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="block text-sm font-semibold text-[#001524ff]"
        >
          Confirm New Password
        </motion.label>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="relative group"
        >
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 pl-12 text-[#001524ff] placeholder-gray-400
              ${confirmPassword ? 'border-[#0098c9ff] ring-2 ring-[#0098c9ff]/20' : 'border-[#fea116ff] hover:border-[#0098c9ff]/50'}`}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FaLock className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-200
            ${confirmPassword ? 'text-[#0098c9ff]' : 'text-[#001524ff]'}`} 
          />
        </motion.div>
      </div>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
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
            Resetting...
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center">
            Reset Password
            <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </motion.button>
    </form>
  );

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
            Reset your password
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[#333333ff] text-lg"
          >
            {step === 1
              ? "Enter your email address and we'll send you an OTP."
              : "Enter the OTP sent to your email and set a new password."}
          </motion.p>
        </div>
        {step === 1 ? renderStep1() : renderStep2()}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-center mt-8 space-y-3"
        >
          <motion.p 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-[#001524ff] cursor-pointer hover:text-[#0098c9ff] transition-colors inline-flex items-center justify-center"
            onClick={() => navigate("/signin")}
          >
            Back to Sign In
            <FaArrowRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;