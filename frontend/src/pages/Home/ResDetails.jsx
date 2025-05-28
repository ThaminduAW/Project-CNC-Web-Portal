import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPepperHot, FaLeaf, FaDollarSign, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaStore, FaUtensils, FaGlobe } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { baseURL } from '../../utils/baseURL';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const ResDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const SPICY_LEVELS = {
    none: 'Not Spicy',
    mild: 'Mild',
    medium: 'Medium',
    hot: 'Hot',
    extraHot: 'Extra Hot'
  };

  const DIETARY_TAGS = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten Free',
    dairyFree: 'Dairy Free',
    nutFree: 'Nut Free',
    halal: 'Halal',
    keto: 'Keto'
  };

  const MENU_CATEGORIES = {
    entree: 'Entrée',
    mainCourse: 'Main Course',
    desserts: 'Desserts',
    beverages: 'Beverages',
    alcoholicDrinks: 'Alcoholic Drinks',
    coffeeAndTea: 'Coffee & Tea'
  };

  // Helper function to convert 24h time to 12h format
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${baseURL}/partners/${id}`);
        if (!response.ok) throw new Error('Failed to fetch restaurant details');
        const data = await response.json();
        setRestaurant(data);
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
        console.error('Error fetching menu:', err);
        // Don't set error for menu fetch failure, just log it
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
              onClick={() => {
                navigate('/restaurants');
                // Scroll to top after navigation
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
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
                src={getImageUrl(restaurant.restaurantPhoto)}
                alt={restaurant.restaurantName}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="p-8">
            {/* Restaurant Information */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#001524ff]">
                Restaurant <span className="text-[#fea116ff]">Information</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-gradient-to-br from-[#fdfcdc] to-white p-6 rounded-xl shadow-lg border border-[#fea116]/20">
                  <h3 className="text-xl font-bold mb-6 text-[#001524ff] flex items-center">
                    <span className="w-8 h-8 bg-[#fea116ff] rounded-full flex items-center justify-center text-white text-sm mr-3">
                      <FaStore />
                    </span>
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                                          <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                          <FaUser />
                        </div>
                      <div>
                        <p className="font-semibold text-[#001524ff]">Restaurant Owner</p>
                        <p className="text-gray-600 text-lg">{restaurant.fullName}</p>
                      </div>
                    </div>
                    
                    {restaurant.address && (
                                              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                            <FaMapMarkerAlt />
                          </div>
                        <div>
                          <p className="font-semibold text-[#001524ff]">Address</p>
                          <p className="text-gray-600">{restaurant.address}</p>
                        </div>
                      </div>
                    )}
                    
                    {restaurant.phone && (
                                              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                            <FaPhone />
                          </div>
                        <div>
                          <p className="font-semibold text-[#001524ff]">Phone Number</p>
                          <a href={`tel:${restaurant.phone}`} className="text-[#fea116ff] hover:text-[#e69510] font-medium transition-colors">
                            {restaurant.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {restaurant.email && (
                                              <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                            <FaEnvelope />
                          </div>
                        <div>
                          <p className="font-semibold text-[#001524ff]">Email Address</p>
                          <a href={`mailto:${restaurant.email}`} className="text-[#fea116ff] hover:text-[#e69510] font-medium transition-colors">
                            {restaurant.email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {restaurant.url && (
                      <div className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-[#fea116ff] rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0">
                          <FaGlobe />
                        </div>
                        <div>
                          <p className="font-semibold text-[#001524ff]">Website</p>
                          <a 
                            href={restaurant.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#fea116ff] hover:text-[#e69510] font-medium transition-colors break-all"
                          >
                            {restaurant.url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                {restaurant.operatingHours && (
                  <div className="bg-gradient-to-br from-[#fdfcdc] to-white p-6 rounded-xl shadow-lg border border-[#fea116]/20">
                    <h3 className="text-xl font-bold mb-6 text-[#001524ff] flex items-center">
                      <span className="w-8 h-8 bg-[#fea116ff] rounded-full flex items-center justify-center text-white text-sm mr-3">
                        <FaClock />
                      </span>
                      Operating Hours
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="space-y-3">
                        {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="font-semibold text-[#001524ff] capitalize">{day}</span>
                            <span className={`font-medium ${hours && hours.open && hours.close 
                              ? 'text-green-600' 
                              : 'text-red-500'
                            }`}>
                              {hours && hours.open && hours.close
                                ? `${formatTime12h(hours.open)} - ${formatTime12h(hours.close)}`
                                : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
            {/* Menu Section */}
            {menuItems && menuItems.length > 0 ? (
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Menu</h2>

                {/* Category Filter */}
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-[#001524ff]">Filter by Category</h3>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === 'all'
                          ? 'bg-[#fea116ff] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Items ({menuItems.length})
                    </button>
                    {Object.entries(MENU_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                      const categoryCount = menuItems.filter(item => item.category === categoryKey).length;
                      if (categoryCount === 0) return null;
                      
                      return (
                        <button
                          key={categoryKey}
                          onClick={() => setSelectedCategory(categoryKey)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedCategory === categoryKey
                              ? 'bg-[#fea116ff] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {categoryLabel} ({categoryCount})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display filtered menu items */}
                {selectedCategory === 'all' ? (
                  // Show all categories when 'all' is selected
                  <>
                    {Object.entries(MENU_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                      const categoryItems = menuItems.filter(item => item.category === categoryKey);
                      if (categoryItems.length === 0) return null;
                  
                                        return (
                        <div key={categoryKey} className="mb-8">
                          <h3 className="text-xl font-semibold mb-4 text-[#001524ff] border-b border-[#fea116ff] pb-2">
                            {categoryLabel}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryItems.map((item, index) => (
                              console.log(item.image),
                              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                                {item.image && (
                                  <div className="relative h-48">
                                    <img 
                                      src={getImageUrl(item.image)} 
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                )}
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold">{item.name}</h3>
                                    <span className="text-[#fea116ff] font-bold">${item.price}</span>
                                  </div>
                                  <p className="text-gray-600 mb-4">{item.description}</p>
                                  
                                  {/* Category */}
                                  {item.category && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <FaUtensils className="mr-2" />
                                      <span>{MENU_CATEGORIES[item.category] || 'Main Course'}</span>
                                    </div>
                                  )}
                                  
                                  {/* Spicy Level */}
                                  {item.spicyLevel !== 'none' && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <FaPepperHot className="mr-2" />
                                      <span>{SPICY_LEVELS[item.spicyLevel]}</span>
                                    </div>
                                  )}

                                  {/* Dietary Tags */}
                                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {item.dietaryTags.map((tag, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                          {DIETARY_TAGS[tag]}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Ingredients */}
                                  {item.ingredients && item.ingredients.length > 0 && (
                                    <div className="mt-4">
                                      <p className="font-medium mb-2">Ingredients:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {item.ingredients.map((ingredient, idx) => (
                                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                            {ingredient}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show items without category or with unknown category */}
                    {(() => {
                      const uncategorizedItems = menuItems.filter(item => 
                        !item.category || !MENU_CATEGORIES[item.category]
                      );
                      if (uncategorizedItems.length === 0) return null;
                      
                      return (
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold mb-4 text-[#001524ff] border-b border-[#fea116ff] pb-2">
                            Other Items
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {uncategorizedItems.map((item, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                                {item.image && (
                                  <div className="relative h-48">
                                    <img 
                                      src={getImageUrl(item.image)} 
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                )}
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold">{item.name}</h3>
                                    <span className="text-[#fea116ff] font-bold">${item.price}</span>
                                  </div>
                                  <p className="text-gray-600 mb-4">{item.description}</p>
                                  
                                  {/* Category */}
                                  {item.category && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <FaUtensils className="mr-2" />
                                      <span>{MENU_CATEGORIES[item.category] || item.category}</span>
                                    </div>
                                  )}
                                  
                                  {/* Spicy Level */}
                                  {item.spicyLevel !== 'none' && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <FaPepperHot className="mr-2" />
                                      <span>{SPICY_LEVELS[item.spicyLevel]}</span>
                                    </div>
                                  )}

                                  {/* Dietary Tags */}
                                  {item.dietaryTags && item.dietaryTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {item.dietaryTags.map((tag, idx) => (
                                        <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                          {DIETARY_TAGS[tag]}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Ingredients */}
                                  {item.ingredients && item.ingredients.length > 0 && (
                                    <div className="mt-4">
                                      <p className="font-medium mb-2">Ingredients:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {item.ingredients.map((ingredient, idx) => (
                                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                            {ingredient}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  // Show only selected category
                  (() => {
                    const categoryItems = menuItems.filter(item => item.category === selectedCategory);
                    if (categoryItems.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No items found in this category.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-[#001524ff] border-b border-[#fea116ff] pb-2">
                          {MENU_CATEGORIES[selectedCategory]}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categoryItems.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                              {item.image && (
                                <div className="relative h-48">
                                  <img 
                                    src={getImageUrl(item.image)} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                  />
                                </div>
                              )}
                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xl font-semibold">{item.name}</h3>
                                  <span className="text-[#fea116ff] font-bold">${item.price}</span>
                                </div>
                                <p className="text-gray-600 mb-4">{item.description}</p>
                                
                                {/* Category */}
                                {item.category && (
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <FaUtensils className="mr-2" />
                                    <span>{MENU_CATEGORIES[item.category] || 'Main Course'}</span>
                                  </div>
                                )}
                                
                                {/* Spicy Level */}
                                {item.spicyLevel !== 'none' && (
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <FaPepperHot className="mr-2" />
                                    <span>{SPICY_LEVELS[item.spicyLevel]}</span>
                                  </div>
                                )}

                                {/* Dietary Tags */}
                                {item.dietaryTags && item.dietaryTags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {item.dietaryTags.map((tag, idx) => (
                                      <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                        {DIETARY_TAGS[tag]}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Ingredients */}
                                {item.ingredients && item.ingredients.length > 0 && (
                                  <div className="mt-4">
                                    <p className="font-medium mb-2">Ingredients:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {item.ingredients.map((ingredient, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                          {ingredient}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Menu</h2>
                <div className="text-center py-8">
                  <p className="text-gray-500">No menu items available at the moment.</p>
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                onClick={() => navigate(`/reservation/`)}
                className="flex-1 bg-[#fea116ff] text-white py-3 rounded-md hover:bg-[#e8920eff] transition-colors"
              >
                Book a Table
              </button>
              <button
                onClick={() => {
                  navigate('/restaurants');
                  // Scroll to top after navigation
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
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
