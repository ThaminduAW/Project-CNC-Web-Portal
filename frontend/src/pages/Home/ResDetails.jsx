import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { baseURL } from '../../utils/baseURL';

const ResDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${baseURL}/partners/${id}`);
        if (!response.ok) throw new Error('Failed to fetch restaurant details');
        const data = await response.json();
        setRestaurant({
          ...data,
          restaurantPhoto: data.restaurantPhoto ? `${baseURL}${data.restaurantPhoto}` : null
        });
      } catch (err) {
        setError(err.message);
      }
    };
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${baseURL}/partners/${id}/menu`);
        if (!response.ok) throw new Error('Failed to fetch menu items');
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        // Optionally handle error
      }
    };
    Promise.all([fetchRestaurant(), fetchMenu()]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl pt-30">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading restaurant details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
        <Header />
        <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">{error || 'Restaurant not found'}</h1>
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
    <div className="bg-[#fdfcdcff] text-[#001524ff] min-h-screen">
      <Header />
      <main className="container mx-auto px-6 md:px-12 py-12 max-w-5xl pt-30">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-[#fea116ff]">{restaurant.restaurantName}</span>
          </h1>
          <p className="text-center text-gray-600 text-lg mt-3">
            {restaurant.cuisine ? `Experience exceptional ${restaurant.cuisine} dining at its finest` : 'Experience exceptional dining at its finest'}
          </p>
        </div>

        {/* Restaurant Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Restaurant Photo */}
          {restaurant.restaurantPhoto && (
            <div className="w-full h-96 relative">
              <img
                src={restaurant.restaurantPhoto}
                alt={restaurant.restaurantName}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = '/restaurant.jpg'; }}
              />
            </div>
          )}

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
                {/* Operating Hours */}
                {restaurant.operatingHours && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-2">Operating Hours</h3>
                    <table className="min-w-full text-left text-gray-700">
                      <tbody>
                        {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                          <tr key={day}>
                            <td className="pr-4 font-medium capitalize">{day}:</td>
                            <td>
                              {hours && hours.open && hours.close
                                ? `${hours.open} - ${hours.close}`
                                : 'Closed'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {restaurant.features && restaurant.features.length > 0 ? (
                    restaurant.features.map((feature, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-[#fea116ff] mr-2">{feature.icon || '⭐'}</span>
                        <span>{feature.name}</span>
                      </div>
                    ))
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* About Section */}
            {restaurant.about && (
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">About the Restaurant</h2>
                <p className="text-gray-600 mb-6">
                  {restaurant.about}
                </p>
              </div>
            )}
            {/* Cooking Services Section */}
            {menuItems && menuItems.length > 0 && (
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Cooking Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((service, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>{service.cookingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Price:</span>
                          <span>${service.portionPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Max Portions per Order:</span>
                          <span>{service.maxFoodPerOrder}</span>
                        </div>
                        {service.includes && service.includes.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Includes:</p>
                            <ul className="list-disc list-inside">
                              {service.includes.map((item, idx) => (
                                <li key={idx} className="text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
