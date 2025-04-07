import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AvailabilityViewer from "../../components/AvailabilityViewer";

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
    guestCount: "1", // Add default guest count
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [status, setStatus] = useState({ success: false, error: "" });

  // Fetch restaurant (partner) list from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partners", {
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
    
    // Reset time slot when date or restaurant changes
    if (name === 'date' || name === 'restaurant') {
      setSelectedTimeSlot(null);
      setFormData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData(prev => ({
      ...prev,
      time: `${slot.startTime}-${slot.endTime}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, error: "" });

    if (!selectedTimeSlot) {
      setStatus({ success: false, error: "Please select an available time slot" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          restaurant: formData.restaurant,
          date: formData.date,
          timeSlot: {
            startTime: selectedTimeSlot.startTime,
            endTime: selectedTimeSlot.endTime
          },
          instructions: formData.instructions,
          guestCount: formData.guestCount
        }),
      });

      const data = await response.json();
      console.log("Reservation Response:", data);

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      setStatus({ success: true, error: "" });
      setFormData({
        name: "",
        email: "",
        contact: "",
        restaurant: "",
        date: "",
        time: "",
        instructions: "",
        guestCount: "1",
      });
      setSelectedTimeSlot(null);

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

            <input
              type="number"
              name="guestCount"
              min="1"
              max="20"
              placeholder="Number of Guests"
              className="w-full px-4 py-2 border rounded-md"
              value={formData.guestCount}
              onChange={handleChange}
              required
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
                  <option key={restaurant._id} value={restaurant._id}>
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
              min={new Date().toISOString().split('T')[0]}
              required
            />

            {formData.restaurant && formData.date && (
              <AvailabilityViewer
                restaurantId={formData.restaurant}
                date={formData.date}
                onTimeSlotSelect={handleTimeSlotSelect}
              />
            )}

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
              className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e69510ff] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedTimeSlot}
            >
              {selectedTimeSlot ? "Confirm Reservation" : "Select a Time Slot"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reservation;
