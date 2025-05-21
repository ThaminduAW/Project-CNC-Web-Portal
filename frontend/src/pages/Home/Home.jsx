import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from "../../components/Hero";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaUtensils, FaFish, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { baseURL } from "../../utils/baseURL";
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const Home = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${baseURL}/partners`);
        const data = await response.json();
        setRestaurants(data.slice(0, 3)); // Display top 3 restaurants ok
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch(`${baseURL}/tours`);
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    setExperiences(storedExperiences);
  }, []);

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />
      <Hero />

      {/* Featured Menu Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#0098c9ff] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#fea116ff] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4">Featured Tours</h2>
              <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Discover our most popular fishing and cooking tours.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.slice(0, 3).map((tour, index) => (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative group"
                whileHover={{ y: -5 }}
              >
                <div className="relative w-full h-[300px] bg-gray-200">
                  {tour.image && (
                    <img 
                      src={getImageUrl(tour.image)}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                    ${tour.price}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-3">{tour.title}</h3>
                      <p className="text-gray-100 mb-4 line-clamp-2 text-lg">{tour.description}</p>
                      <div className="flex items-center text-base text-gray-200 mb-6">
                        <FaMapMarkerAlt className="mr-2 text-[#fea116ff]" />
                        <span>{tour.location}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/tours/${tour._id}`)}
                        className="w-full bg-[#fea116ff] text-white py-3 rounded-lg hover:bg-[#e8920eff] transition-colors font-semibold flex items-center justify-center text-lg"
                      >
                        View Tour <FaFish className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/tours')}
              className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View All Tours <FaFish className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0098c9ff] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fea116ff] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4">Featured Restaurants</h2>
              <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Discover our top-rated seafood restaurants.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative group"
                whileHover={{ y: -5 }}
              >
                <div className="relative w-full h-[300px] bg-gray-200">
                  {restaurant.restaurantPhoto ? (
                    <img 
                      src={getImageUrl(restaurant.restaurantPhoto)}
                      alt={restaurant.restaurantName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaUtensils className="text-6xl text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                    {restaurant.rating || 0} <FaStar className="inline-block ml-1" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-3">{restaurant.restaurantName}</h3>
                      <p className="text-gray-100 mb-4 line-clamp-2 text-lg">{restaurant.about || 'Experience exceptional dining at its finest'}</p>
                      <div className="flex items-center text-base text-gray-200 mb-6">
                        <FaMapMarkerAlt className="mr-2 text-[#fea116ff]" />
                        <span>{restaurant.address}</span>
                      </div>
                      {restaurant.cuisine && (
                        <div className="mb-4">
                          <span className="inline-block bg-[#fea116ff]/20 text-[#fea116ff] px-3 py-1 rounded-full text-sm">
                            {restaurant.cuisine}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/restaurant-details/${restaurant._id}`)}
                        className="w-full bg-[#fea116ff] text-white py-3 rounded-lg hover:bg-[#e8920eff] transition-colors font-semibold flex items-center justify-center text-lg"
                      >
                        View Restaurant <FaUtensils className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View All Restaurants <FaUtensils className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="relative py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white to-[#fdfcdcff]">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#0098c9ff] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-[#fea116ff] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Left Side - Experiences */}
            <div>
              <div className="text-left mb-8 sm:mb-10 md:mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-[#0098c9ff] via-[#fea116ff] to-[#001524ff] bg-clip-text text-transparent drop-shadow-lg">
                    Experience the Adventure
                  </h2>
                  <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] mb-3 sm:mb-4 rounded-full animate-pulse"></div>
                  <p className="text-gray-700 text-base sm:text-lg font-medium">Discover the thrill of fishing and cooking your own seafood.</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Experience Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-xl col-span-1 sm:col-span-2 bg-white/30 backdrop-blur-lg border border-white/30 hover:border-[#fea116ff] transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src="https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2VhZm9vZHxlbnwwfDB8MHx8fDA%3D"
                      alt="Deep Sea Fishing"
                      className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end">
                    <div className="p-4 sm:p-6 text-white">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] bg-clip-text text-transparent drop-shadow-lg">Deep Sea Fishing</h3>
                      <p className="text-sm sm:text-base mb-3 sm:mb-4 text-gray-100">Experience the thrill of catching your own fish in the deep blue sea.</p>
                      <button className="relative px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] text-white shadow-lg hover:from-[#fea116ff] hover:to-[#0098c9ff] transition-all duration-300 overflow-hidden">
                        <span className="relative z-10">Learn More →</span>
                        <span className="absolute inset-0 rounded-full border-2 border-[#fea116ff] opacity-0 group-hover:opacity-100 animate-pulse"></span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-xl sm:rounded-2xl pointer-events-none group-hover:animate-glow border-2 border-transparent group-hover:border-[#fea116ff] transition-all duration-300"></div>
                </motion.div>
              </div>
            </div>

            {/* Right Side - About Us */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:pl-6 xl:pl-12 mt-8 lg:mt-0"
            >
              <div className="text-[#fea116ff] text-base sm:text-lg font-semibold mb-2">About Us</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#0098c9ff] via-[#fea116ff] to-[#001524ff] bg-clip-text text-transparent drop-shadow-lg">
                Welcome to <span className="text-[#fea116ff] flex items-center">Catch & Cook <FaUtensils className="ml-1 sm:ml-2" /></span>
              </h2>
              <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base font-medium">
                At Catch and Cook World Tour, we are driven by a passion for authentic culinary experiences and a profound love for the sea. Our journey is spearheaded by our visionary founder, Kim, whose deep-rooted connection to seafood spans two decades. With unparalleled expertise in catching and cooking seafood, Kim has embarked on a mission to share the unparalleled joy of harvesting and savoring the ocean's bounty.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-[#fea116ff] font-extrabold drop-shadow-lg">15</div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Years of</div>
                    <div className="text-gray-600 text-xs sm:text-sm">EXPERIENCE</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-[#fea116ff] font-extrabold drop-shadow-lg">50</div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Popular</div>
                    <div className="text-gray-600 text-xs sm:text-sm">RESTAURANTS</div>
                  </div>
                </div>
              </div>

              <button className="relative px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-bold bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] text-white shadow-xl hover:from-[#0098c9ff] hover:to-[#fea116ff] transition-all duration-300 overflow-hidden">
                <span className="relative z-10">READ MORE</span>
                <span className="absolute inset-0 rounded-full border-2 border-[#0098c9ff] opacity-0 hover:opacity-100 animate-pulse"></span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-[#0098c9ff] to-[#001524ff] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose CNC World Tour?</h2>
            <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
            <p className="text-lg text-gray-100">Your ultimate seafood adventure starts here.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-xl font-bold mb-3">Thrilling Fishing Tours</h3>
              <p className="text-gray-100">Catch your own seafood and experience deep-sea fishing like never before.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🍽</div>
              <h3 className="text-xl font-bold mb-3">Cook Like a Chef</h3>
              <p className="text-gray-100">Learn professional seafood preparation from world-class chefs.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-8 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">Sustainable Practices</h3>
              <p className="text-gray-100">We prioritize eco-friendly fishing methods to protect marine life.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 px-6 md:px-12 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#fea116ff] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Real experiences from seafood lovers worldwide.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic mb-4">"A truly once-in-a-lifetime experience! The seafood was fresh, and the fishing tour was exhilarating!"</p>
              <p className="font-bold text-[#001524ff]">John Doe</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic mb-4">"Highly recommend for seafood lovers! Catching my own fish and cooking it was amazing."</p>
              <p className="font-bold text-[#001524ff]">Sarah Lee</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic mb-4">"Incredible food, stunning locations, and amazing guides. I will be back for another tour!"</p>
              <p className="font-bold text-[#001524ff]">Mark Evans</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-To-Action Section */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-[#fea116ff] to-[#e8920eff] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-5xl relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-[#001524ff] mb-4">Join the Ultimate Seafood Adventure</h2>
            <p className="text-[#001524ff] text-lg mb-8">Book your experience now and create unforgettable memories.</p>
            <a 
              href="/reservation" 
              className="inline-block bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105"
            >
              Book a Reservation
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
