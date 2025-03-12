const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] h-[85vh] flex flex-col items-center justify-center text-white text-center px-6">
      
      {/* Floating Animated Elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full animate-bounce"></div>
      <div className="absolute bottom-0 right-0 w-28 h-28 bg-white opacity-10 rounded-full animate-pulse"></div>

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
          <span className="text-[#001524ff]">Catch. Cook. Enjoy.</span> The Ultimate Seafood Experience!
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-100 drop-shadow-md">
          Join us for unforgettable culinary adventures, exclusive catch & cook experiences, and the best seafood in the world.
        </p>

        {/* Call-To-Action Buttons */}
        <div className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <a href="/reservation" className="bg-white text-[#0098c9ff] px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-200 transition">
            Book a Reservation
          </a>
          <a href="/restaurants" className="bg-[#001524ff] text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-[#00345cff] transition">
            Explore Restaurants
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
