import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from "../../components/Hero";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partners");
        const data = await response.json();
        setRestaurants(data.slice(0, 3)); // Display top 3 restaurants Rusg ko edit agin 
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    setExperiences(storedExperiences);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <Hero />

      

      {/* Experiences Section */}
      <section className="py-12 px-6 md:px-12">
      <h2 className="text-3xl font-bold text-center">Explore our Tour Partner Restaurants</h2>
      <p className="text-center text-gray-600 mt-2">Experience the best seafood dishes from around the world.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/experience/${experience.id}`)}
            >
              {experience.images && experience.images[0] && (
                <img
                  src={experience.images[0]}
                  alt={experience.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{experience.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{experience.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">${experience.price}</span>
                  <button
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 px-6 md:px-12 bg-[#0098c9ff] text-white text-center">
        <h2 className="text-3xl font-bold">Why Choose CNC World Tour?</h2>
        <p className="mt-2 text-lg">Your ultimate seafood adventure starts here.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">🌊 Thrilling Fishing Tours</h3>
            <p>Catch your own seafood and experience deep-sea fishing like never before.</p>
          </div>
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">🍽 Cook Like a Chef</h3>
            <p>Learn professional seafood preparation from world-class chefs.</p>
          </div>
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">🌍 Sustainable Practices</h3>
            <p>We prioritize eco-friendly fishing methods to protect marine life.</p>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-12 px-6 md:px-12 text-center">
        <h2 className="text-3xl font-bold">What Our Customers Say</h2>
        <p className="text-gray-600 mt-2">Real experiences from seafood lovers worldwide.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white shadow-md rounded-lg">
            <p className="text-gray-700 italic">"A truly once-in-a-lifetime experience! The seafood was fresh, and the fishing tour was exhilarating!"</p>
            <p className="mt-2 font-bold">⭐⭐⭐⭐⭐ - John Doe</p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-lg">
            <p className="text-gray-700 italic">"Highly recommend for seafood lovers! Catching my own fish and cooking it was amazing."</p>
            <p className="mt-2 font-bold">⭐⭐⭐⭐⭐ - Sarah Lee</p>
          </div>
          <div className="p-6 bg-white shadow-md rounded-lg">
            <p className="text-gray-700 italic">"Incredible food, stunning locations, and amazing guides. I will be back for another tour!"</p>
            <p className="mt-2 font-bold">⭐⭐⭐⭐⭐ - Mark Evans</p>
          </div>
        </div>
      </section>

      {/* Call-To-Action Section */}
      <section className="py-12 px-6 md:px-12 text-center bg-[#fea116ff]">
        <h2 className="text-3xl font-bold">Join the Ultimate Seafood Adventure</h2>
        <p className="text-[#001524ff] mt-2 text-lg">Book your experience now and create unforgettable memories.</p>
        <a href="/reservation" className="mt-4 inline-block bg-[#001524ff] text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-[#00345cff] transition">
          Book a Reservation
        </a>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
