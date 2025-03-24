import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion } from "framer-motion";

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/signin", {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfcdcff] to-[#ffffff]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-[#fdfcdcff]"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.img 
            src={logo} 
            alt="CNC Logo" 
            className="h-20 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <h2 className="text-3xl font-bold text-[#001524ff] mb-2">Welcome Back!</h2>
          <p className="text-[#333333ff] text-lg">Sign in to your account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                placeholder="Enter your email"
                required
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#333333ff]">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#fdfcdcff] rounded-xl focus:ring-2 focus:ring-[#0098c9ff] focus:border-transparent transition-all duration-200 pl-12"
                placeholder="Enter your password"
                required
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-[#333333ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#fea116ff] to-[#e69510ff] text-white py-3 rounded-xl hover:from-[#e69510ff] hover:to-[#fea116ff] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="text-center mt-8 space-y-3">
          <p className="text-sm text-[#333333ff]">
            Not a registered partner?{" "}
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-[#0098c9ff] font-semibold cursor-pointer hover:text-[#0087b8ff] transition-colors"
              onClick={() => navigate("/signup")}
            >
              Sign Up
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

export default SignIn;
