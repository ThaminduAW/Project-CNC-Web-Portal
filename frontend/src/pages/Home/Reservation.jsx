import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Reservation = () => {
  const [restaurants, setRestaurants] = useState([]); // Stores fetched restaurants
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    restaurant: "",
    date: "",
    time: "",
    instructions: "",
  });

  const [status, setStatus] = useState({ success: false, error: "" });

  // Fetch restaurant (partner) list from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partners");

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Restaurants:", data); // Debugging Output

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        setRestaurants(data); // Ensure correct data is set
      } catch (err) {
        console.error("Error fetching restaurants:", err.message);
        setRestaurants([]); // Prevent crash by setting an empty array
      }
    };

    fetchRestaurants();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, error: "" });

    try {
      const response = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Reservation Response:", data);

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      setStatus({ success: true, error: "" });
      setFormData({ name: "", email: "", contact: "", restaurant: "", date: "", time: "", instructions: "" });

      setTimeout(() => setStatus({ success: false, error: "" }), 5000);
    } catch (err) {
      console.error("Reservation error:", err);
      setStatus({ success: false, error: err.message });
    }
  };

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />

      <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Make a <span className="text-[#fea116ff]">Reservation</span>
        </h1>
        <p className="text-center text-gray-600 text-lg mt-3">
          Book your spot at one of our partner restaurants and experience the finest seafood.
        </p>

        {/* Reservation Form */}
        <div className="bg-white p-6 mt-10 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center">Reserve Your Table</h2>

          {status.success && (
            <p className="text-green-500 text-center mt-4">✅ Reservation made successfully! Check your email for confirmation.</p>
          )}
          {status.error && (
            <p className="text-red-500 text-center mt-4">❌ {status.error}</p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="contact"
              placeholder="Contact Number (Optional)"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.contact}
              onChange={handleChange}
            />

            {/* Restaurant Selection Dropdown */}
            <select
              name="restaurant"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.restaurant}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a Restaurant</option>
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant.restaurantName}>
                    {restaurant.restaurantName}
                  </option>
                ))
              ) : (
                <option value="" disabled>No restaurants available</option>
              )}
            </select>

            <input
              type="date"
              name="date"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="time"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.time}
              onChange={handleChange}
              required
            />

            <textarea
              name="instructions"
              placeholder="Special Instructions (Optional)"
              rows="4"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.instructions}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e69510ff] transition"
            >
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reservation;
