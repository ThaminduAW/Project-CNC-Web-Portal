import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // Ensure the path is correct

const SignIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("🔹 Sending sign-in request:", formData);

    try {
      const response = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("🔹 Sign-in response received:", data);

      if (!response.ok) throw new Error(data.message);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      console.log("✅ User signed in successfully. Redirecting...");

      // ✅ Fix: Only show pending approval message if approved is **explicitly false**
      if (data.user.role === "Partner" && data.user.approved === false) {
        console.log("❌ User is pending approval.");
        setError("Your account is pending admin approval.");
        return;
      }

      // ✅ Admin Redirect
      if (data.user.role === "Admin") {
        console.log("✅ Redirecting Admin to /admin/dashboard");
        navigate("/admin/dashboard"); // ✅ Correct Path

      // ✅ Partner Redirect
      } else if (data.user.role === "Partner") {
        console.log("✅ Redirecting Partner to /partner/dashboard");
        navigate("/partner/dashboard"); // ✅ Redirect to Partner Portal

      } else {
        console.log("✅ Redirecting User to Home");
        navigate("/"); // ✅ Default Redirect
      }
    } catch (err) {
      console.error("❌ Sign-in error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfcdcff]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="CNC Logo" className="h-16" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-[#001524ff]">CNC World Tour</h2>
        <p className="text-gray-600 text-center mb-4">Sign in to your account</p>

        {error && <p className="text-red-500 text-sm text-center">❌ {error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            className="w-full px-4 py-2 border rounded-md" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="w-full px-4 py-2 border rounded-md" 
            onChange={handleChange} 
            required 
          />

          <button 
            type="submit"
            className="w-full bg-[#fea116ff] text-[#001524ff] py-2 rounded-md hover:bg-[#e69510ff] transition"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Not a registered partner?{" "}
            <span className="text-[#0098c9ff] cursor-pointer" onClick={() => navigate("/signup")}>
              Sign Up
            </span>
          </p>
          <p className="text-sm text-gray-500 cursor-pointer mt-2" onClick={() => navigate("/")}>
            Return to home
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
