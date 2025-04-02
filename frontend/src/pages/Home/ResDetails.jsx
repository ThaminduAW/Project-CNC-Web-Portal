import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ResDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurant = location.state?.restaurant;

  if (!restaurant) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Restaurant not found</h1>
            <button
              onClick={() => navigate('/restaurants')}
              className="mt-4 bg-[#fea116ff] text-white px-6 py-2 rounded-md hover:bg-[#e8920eff] transition-colors"
            >
              Back to Restaurants
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-[#fea116ff]">{restaurant.restaurantName}</span>
          </h1>
          <p className="text-center text-gray-600 text-lg mt-3">
            Experience exceptional seafood dining at its finest
          </p>
        </div>

        {/* Restaurant Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Restaurant Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-[#fea116ff] mr-2">👤</span>
                    <div>
                      <p className="font-semibold">Owner</p>
                      <p className="text-gray-600">{restaurant.fullName}</p>
                    </div>
                  </div>
                  
                  {restaurant.address && (
                    <div className="flex items-center">
                      <span className="text-[#fea116ff] mr-2">📍</span>
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-gray-600">{restaurant.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex items-center">
                      <span className="text-[#fea116ff] mr-2">📞</span>
                      <div>
                        <p className="font-semibold">Phone</p>
                        <p className="text-gray-600">{restaurant.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {restaurant.email && (
                    <div className="flex items-center">
                      <span className="text-[#fea116ff] mr-2">✉️</span>
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-gray-600">{restaurant.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#fea116ff] mr-2">🍽️</span>
                    <span>Fresh Seafood</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#fea116ff] mr-2">👨‍🍳</span>
                    <span>Expert Chefs</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#fea116ff] mr-2">⭐</span>
                    <span>Premium Service</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-[#fea116ff] mr-2">🌊</span>
                    <span>Ocean View</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold mb-4">About the Restaurant</h2>
              <p className="text-gray-600 mb-6">
                {restaurant.description || `Welcome to ${restaurant.restaurantName}, where we pride ourselves on serving the finest seafood dishes. Our commitment to quality and customer satisfaction makes us a premier destination for seafood lovers.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                onClick={() => window.location.href = `mailto:${restaurant.email}`}
                className="flex-1 bg-[#fea116ff] text-white py-3 rounded-md hover:bg-[#e8920eff] transition-colors"
              >
                Contact Restaurant
              </button>
              <button
                onClick={() => navigate('/restaurants')}
                className="flex-1 bg-[#001524ff] text-white py-3 rounded-md hover:bg-[#00345cff] transition-colors"
              >
                Back to Restaurants
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResDetails;
