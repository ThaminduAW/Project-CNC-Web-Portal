import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import bgImage from '../assets/bg-home.jpg';
import plateImage from '../assets/hero.png';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={`relative min-h-screen ${styles['hero-header']}`}>
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(rgba(173, 216, 230, .9), rgba(0, 0, 0, .5)), url(${bgImage})`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      />
      

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] container mx-auto px-4 sm:px-6 flex items-center">
        <div className="w-full lg:w-1/2 text-white pt-20 lg:pt-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2"
          >
            From Ocean to Plate:
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          >
            Our Passion for Food and Travel
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-xl"
          >
            Welcome to Catch N Cook World Tour, the ultimate adventure for foodies and nature
            enthusiasts alike. We offer immersive tours that explore and celebrate local cuisine
            while promoting sustainable tourism and preserving the natural beauty of our
            destinations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/reservation"
              className="inline-block bg-[#fea116] text-white px-6 sm:px-8 py-3 rounded text-base sm:text-lg font-semibold 
                       hover:bg-[#e8920e] transition-all duration-300 text-center"
            >
              BOOK A TABLE
            </Link>
          </motion.div>
        </div>

        {/* Plate Image with rotation animation */}
        <motion.div 
          className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-[500px] xl:w-[600px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={plateImage}
            alt="Grilled Fish Dish"
            className={`w-full h-full object-contain ${styles['rotating-image']}`}
          />
        </motion.div>
      </div>

      <style jsx="true">{`
        @keyframes imgRotate {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
