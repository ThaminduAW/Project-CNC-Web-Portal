const Hero = () => {
    return (
      <section className="relative bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] h-[80vh] flex flex-col items-center justify-center text-white text-center px-6">
        {/* Animated Decorative Shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full"></div>
  
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            Experience the Ultimate <span className="text-[#001524ff]">Seafood Adventure</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-100 drop-shadow-md">
            Join us for exclusive catch & cook experiences, world-class seafood restaurants, and unforgettable culinary journeys.
          </p>
  
          {/* Call-To-Action Buttons */}
          <div className="mt-6 flex space-x-4">
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
  