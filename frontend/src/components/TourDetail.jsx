import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import Header from './Header';
import Footer from './Footer';
import { baseURL } from '../../utils/baseURL';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`${baseURL}/tours/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tour');
        }
        const data = await response.json();
        setTour(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff]">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="text-center text-gray-600">
            <p>Tour not found</p>
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
        {/* Back to Tours Button */}
        <button
          onClick={() => navigate('/tours')}
          className="mb-6 flex items-center text-[#fea116ff] hover:text-[#e69510ff] transition duration-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tours
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tour Image */}
          <div className="relative h-96">
            <img
              src={getImageUrl(tour.image)}
              alt={tour.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001524ff] to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl font-bold mb-2 text-white">{tour.title}</h1>
              <p className="text-lg text-gray-200">{tour.briefDescription}</p>
            </div>
          </div>

          {/* Tour Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#fea116ff] mb-3">Detailed Description</h2>
                  <p className="text-gray-700 leading-relaxed">{tour.detailedDescription}</p>
                </div>

                {tour.optionalDetails && (
                  <div>
                    <h2 className="text-2xl font-semibold text-[#fea116ff] mb-3">Additional Information</h2>
                    <p className="text-gray-700 leading-relaxed">{tour.optionalDetails}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h2 className="text-2xl font-semibold text-[#fea116ff] mb-4">Tour Information</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Time Duration:</span>
                      <span className="font-medium text-[#001524ff]">{tour.timeDuration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-[#fea116ff]">${tour.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-[#001524ff]">{new Date(tour.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-[#001524ff]">{tour.location}</span>
                    </div>
                  </div>
                </div>

                {/* Participating Restaurants Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-2xl font-semibold text-[#fea116ff] mb-6">Participating Restaurants</h2>
                  <div className="space-y-8">
                    {tour.restaurants.map((restaurantData, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        <h3 className="text-xl font-semibold text-[#001524ff] mb-4">
                          {restaurantData.restaurant.restaurantName}
                        </h3>
                        
                        {/* Restaurant Menu */}
                        {restaurantData.menu && restaurantData.menu.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {restaurantData.menu.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
                                {item.image && (
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                    onError={handleImageError}
                                  />
                                )}
                                <h4 className="font-medium text-[#001524ff]">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                                <p className="text-[#fea116ff] font-medium mt-2">${item.price}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No menu items available yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="w-full bg-[#0098c9ff] hover:bg-[#0084b3ff] text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TourDetail; 