import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from "../../components/Hero";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaUtensils, FaFish, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

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
        const response = await fetch("http://localhost:3000/api/partners");
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
        const response = await fetch("http://localhost:3000/api/tours");
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
              <h2 className="text-4xl font-bold mb-4">Featured Menu Items</h2>
              <div className="w-24 h-1 bg-[#fea116ff] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Discover our most popular seafood dishes from partner restaurants.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative group"
                whileHover={{ y: -5 }}
              >
                <div className="relative w-full h-[400px] bg-gray-200">
                  {item.image && (
                    <img 
                      src={`http://localhost:3000${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                    ${item.price}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-gray-100 mb-4 line-clamp-2 text-lg">{item.description}</p>
                      <div className="flex items-center text-base text-gray-200 mb-6">
                        <FaMapMarkerAlt className="mr-2 text-[#fea116ff]" />
                        <span>{item.restaurant}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/menu/${item.id}`)}
                        className="w-full bg-[#fea116ff] text-white py-3 rounded-lg hover:bg-[#e8920eff] transition-colors font-semibold flex items-center justify-center text-lg"
                      >
                        View Menu <FaUtensils className="ml-2" />
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
              onClick={() => navigate('/events')}
              className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              View Full Menu <FaFish className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="relative py-16 bg-gradient-to-b from-white to-[#fdfcdcff]">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#0098c9ff] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#fea116ff] opacity-5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 md:px-12 max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Experiences */}
            <div>
              <div className="text-left mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-4xl font-bold mb-4">Experience the Adventure</h2>
                  <div className="w-24 h-1 bg-[#fea116ff] mb-4"></div>
                  <p className="text-gray-600 text-lg">Discover the thrill of fishing and cooking your own seafood.</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Experience Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative group overflow-hidden rounded-xl shadow-lg col-span-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src="https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2VhZm9vZHxlbnwwfDB8MHx8fDA%3D"
                      alt="Deep Sea Fishing"
                      className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">Deep Sea Fishing</h3>
                      <p className="text-sm mb-4">Experience the thrill of catching your own fish in the deep blue sea.</p>
                      <button className="bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#e8920eff] transition-colors font-semibold">
                        Learn More →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="text-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* <button
                  onClick={() => navigate('/events')}
                  className="bg-[#001524ff] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00345cff] transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                >
                  Explore All Experiences <FaFish className="ml-2" />
                </button> */}
              </motion.div>
            </div>

            {/* Right Side - About Us */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:pl-12"
            >
              <div className="text-[#fea116ff] text-lg font-semibold mb-2">About Us</div>
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                Welcome to <span className="text-[#fea116ff] flex items-center">Catch & Cook <FaUtensils className="ml-2" /></span>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                At Catch and Cook World Tour, we are driven by a passion for authentic culinary experiences and a profound love for the sea. Our journey is spearheaded by our visionary founder, Kim, whose deep-rooted connection to seafood spans two decades. With unparalleled expertise in catching and cooking seafood, Kim has embarked on a mission to share the unparalleled joy of harvesting and savoring the ocean's bounty.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-4xl text-[#fea116ff]">15</div>
                  <div>
                    <div className="font-semibold">Years of</div>
                    <div className="text-gray-600">EXPERIENCE</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl text-[#fea116ff]">50</div>
                  <div>
                    <div className="font-semibold">Popular</div>
                    <div className="text-gray-600">RESTAURANTS</div>
                  </div>
                </div>
              </div>

              <button className="bg-[#fea116ff] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#e8920eff] transition-all duration-300 transform hover:scale-105">
                READ MORE
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
