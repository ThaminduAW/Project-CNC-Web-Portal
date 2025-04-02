import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import restaurantImage from "../../assets/restaurant.jpg";

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partners");
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

  const handleViewDetails = (restaurant) => {
    navigate('/restaurant-details', { state: { restaurant } });
  };

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">
            Discover <span className="text-[#fea116ff]">Our Partner Restaurants</span>
          </h1>
          <p className="text-center text-gray-600 text-lg mt-3">
            Experience the finest seafood dining with our carefully selected partner restaurants.
          </p>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant._id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-[#001524ff]">
                    {restaurant.restaurantName}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-[#fea116ff] mr-2">👤</span>
                      <p className="text-gray-700">Owner: {restaurant.fullName}</p>
                    </div>
                    
                    {restaurant.address && (
                      <div className="flex items-center">
                        <span className="text-[#fea116ff] mr-2">📍</span>
                        <p className="text-gray-700">{restaurant.address}</p>
                      </div>
                    )}
                    
                    {restaurant.phone && (
                      <div className="flex items-center">
                        <span className="text-[#fea116ff] mr-2">📞</span>
                        <p className="text-gray-700">{restaurant.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                    <button 
                      className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e8920eff] transition-colors"
                      onClick={() => handleViewDetails(restaurant)}
                    >
                      View Details
                    </button>
                    <button 
                      className="w-full bg-[#001524ff] text-white py-2 rounded-md hover:bg-[#00345cff] transition-colors"
                      onClick={() => window.location.href = `mailto:${restaurant.email}`}
                    >
                      Contact Restaurant
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our Partner Restaurants?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🍽️</div>
              <h3 className="font-semibold mb-2">Fresh Seafood</h3>
              <p className="text-gray-600">Daily fresh catches and premium ingredients</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👨‍🍳</div>
              <h3 className="font-semibold mb-2">Expert Chefs</h3>
              <p className="text-gray-600">Experienced culinary professionals</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold mb-2">Quality Service</h3>
              <p className="text-gray-600">Exceptional dining experience</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Restaurants;
