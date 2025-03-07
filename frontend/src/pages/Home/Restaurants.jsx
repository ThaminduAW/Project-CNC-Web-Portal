import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import restaurantImage from "../../assets/restaurant.jpg"; // Update with actual image
import chefImage from "../../assets/chef-cooking.jpg"; // Update with actual image

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partners"); // Ensure this endpoint exists
        if (!response.ok) throw new Error("Failed to fetch restaurants");

        const data = await response.json();
        setRestaurants(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      {/* Header Component */}
      <Header />

      {/* Restaurants Section */}
      <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Explore <span className="text-[#fea116ff]">Exquisite Seafood Dining</span>
        </h2>
        <p className="text-center text-gray-600 text-lg mt-3">
          Our partner restaurants offer **premium seafood dishes**, caught fresh and cooked to perfection.
        </p>

        {/* Image & Content Section */}
        <div className="flex flex-col md:flex-row items-center mt-10">
          {/* Image */}
          <img src={restaurantImage} alt="Partner Restaurant" className="w-full md:w-1/2 rounded-lg shadow-lg" />

          {/* Text Content */}
          <div className="md:ml-10 mt-6 md:mt-0">
            <h2 className="text-2xl font-semibold">A Taste of the Ocean</h2>
            <p className="text-gray-600 mt-2">
              Each of our partner restaurants is carefully selected to provide an **unmatched seafood experience**. Whether it's a **coastal bistro, a fine dining restaurant, or a rustic seafood shack**, our partners bring the **freshest catches to your plate**.
            </p>
          </div>
        </div>

        {/* Restaurant Listings */}
        <div className="bg-white p-6 md:p-10 mt-12 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center">Meet Our Partner Restaurants</h2>
          <p className="text-gray-600 text-center mt-2">
            Each restaurant brings a unique blend of **local flavors, expert chefs, and high-quality seafood**.
          </p>

          {/* Loading & Error Handling */}
          {loading && <p className="text-center text-gray-500 mt-6">Loading restaurants...</p>}
          {error && <p className="text-center text-red-500 mt-6">Error: {error}</p>}

          {/* Restaurant Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="p-4 bg-[#fea116ff] text-white rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-semibold">{restaurant.restaurantName}</h3>
                  <p className="text-sm">👤 Owner: {restaurant.fullName}</p>
                  {restaurant.address && <p className="text-sm">📍 {restaurant.address}</p>}
                  {restaurant.phone && <p className="text-sm">📞 {restaurant.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image & Final Message Section */}
        <div className="flex flex-col md:flex-row items-center mt-12">
          {/* Text Content */}
          <div className="md:mr-10 mb-6 md:mb-0">
            <h2 className="text-2xl font-semibold">Your Ultimate Seafood Experience Awaits</h2>
            <p className="text-gray-600 mt-2">
              Whether you're a seafood lover, a gourmet explorer, or just looking for **authentic dining**, our partner restaurants will take your taste buds on an **unforgettable journey**.  
              <br /><br />
              **Visit, Taste, Enjoy – Seafood Like Never Before!**
            </p>
          </div>

          {/* Image */}
          <img src={chefImage} alt="Chef Cooking" className="w-full md:w-1/2 rounded-lg shadow-lg" />
        </div>

      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Restaurants;
