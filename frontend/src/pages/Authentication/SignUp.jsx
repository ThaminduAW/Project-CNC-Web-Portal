import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // Update path if needed

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    console.log("Sending sign-up request:", formData);

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Sign-up response received:", data);

      if (!response.ok) throw new Error(data.message);

      console.log("User registered successfully. Redirecting to sign-in...");
      navigate("/signin");
    } catch (err) {
      console.error("Sign-up error:", err.message);
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
        <p className="text-gray-600 text-center mb-4">Register as a partner</p>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="fullName" placeholder="Full Name" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
          <input type="text" name="restaurantName" placeholder="Restaurant Name" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address (Optional)" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone Number (Optional)" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />

          {/* Password Input + Instructions */}
          <div>
            <input type="password" name="password" placeholder="Password" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least <b>8 characters</b> long and include:
            </p>
            <ul className="list-disc list-inside text-xs text-gray-500">
              <li>One uppercase letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>

          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full px-4 py-2 border rounded-md" onChange={handleChange} required />

          <button className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e69510ff]">
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <span className="text-[#0098c9ff] cursor-pointer" onClick={() => navigate("/signin")}>
              Sign In
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

export default SignUp;
