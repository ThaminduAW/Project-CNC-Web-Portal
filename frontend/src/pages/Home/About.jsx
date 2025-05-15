import Header from "../../components/Header";
import Footer from "../../components/Footer";
import aboutImage from "../../assets/about-image.jpg"; 
import seafoodImage from "../../assets/seafood.jpg"; 
const About = () => {
  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      {/* Header Component */}
      <Header />

      {/* About Section */}
      <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl pt-30">
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Discover <span className="text-[#fea116ff]">CNC World Tour</span>
        </h1>
        <p className="text-center text-gray-600 text-lg mt-3">
          Experience the thrill of the ocean, the joy of the catch, and the art of cooking – all in one extraordinary journey.
        </p>

        {/* Image & Content Section */}
        <div className="flex flex-col md:flex-row items-center mt-10">
          {/* Image */}
          <img src={aboutImage} alt="CNC Adventure" className="w-full md:w-1/2 rounded-lg shadow-lg" />

          {/* Text Content */}
          <div className="md:ml-10 mt-6 md:mt-0">
            <h2 className="text-2xl font-semibold">A Journey Rooted in Passion</h2>
            <p className="text-gray-600 mt-2">
              CNC World Tour was born from a deep love for the sea and a desire to create unforgettable seafood experiences. Our mission is to bring people closer to nature by exploring, fishing, and cooking in some of the most breathtaking locations worldwide.
            </p>
          </div>
        </div>

        {/* Why Choose CNC Section */}
        <div className="bg-white/30 backdrop-blur-lg p-6 md:p-10 mt-12 rounded-2xl shadow-2xl border border-white/30">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-[#0098c9ff] via-[#fea116ff] to-[#001524ff] bg-clip-text text-transparent drop-shadow-lg">
            Why Choose CNC World Tour?
          </h2>
          <p className="text-gray-700 text-center mt-2 font-medium">
            More than just a tour – it's an adventure that immerses you in the beauty of the ocean and the traditions of sustainable fishing.
          </p>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-white/40 backdrop-blur-lg rounded-xl shadow-lg text-center border border-white/30 hover:border-[#fea116ff] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -inset-1 rounded-xl pointer-events-none group-hover:animate-glow border-2 border-transparent group-hover:border-[#fea116ff] transition-all duration-300"></div>
              <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-[#fea116ff] to-[#0098c9ff] bg-clip-text text-transparent drop-shadow">🌊 Connect with Nature</h3>
              <p className="text-sm text-gray-700 font-medium">Experience the thrill of catching fresh seafood in its natural habitat.</p>
            </div>
            <div className="p-6 bg-white/40 backdrop-blur-lg rounded-xl shadow-lg text-center border border-white/30 hover:border-[#fea116ff] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -inset-1 rounded-xl pointer-events-none group-hover:animate-glow border-2 border-transparent group-hover:border-[#fea116ff] transition-all duration-300"></div>
              <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-[#0098c9ff] to-[#fea116ff] bg-clip-text text-transparent drop-shadow">🍽 Culinary Mastery</h3>
              <p className="text-sm text-gray-700 font-medium">Learn from expert chefs and turn your catch into a gourmet delight.</p>
            </div>
            <div className="p-6 bg-white/40 backdrop-blur-lg rounded-xl shadow-lg text-center border border-white/30 hover:border-[#fea116ff] transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -inset-1 rounded-xl pointer-events-none group-hover:animate-glow border-2 border-transparent group-hover:border-[#fea116ff] transition-all duration-300"></div>
              <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-[#fea116ff] to-[#001524ff] bg-clip-text text-transparent drop-shadow">🌍 Sustainable Practices</h3>
              <p className="text-sm text-gray-700 font-medium">Understand and embrace responsible fishing techniques for a better future.</p>
            </div>
          </div>
        </div>

        {/* Image & Final Message Section */}
        <div className="flex flex-col md:flex-row items-center mt-12">
          {/* Text Content */}
          <div className="md:mr-10 mb-6 md:mb-0">
            <h2 className="text-2xl font-semibold">Join Us on This Epic Journey</h2>
            <p className="text-gray-600 mt-2">
              Whether you're a seafood enthusiast, an adventurer at heart, or simply someone who loves extraordinary experiences, CNC World Tour is your gateway to the ultimate ocean adventure.  
              <br /><br />
              Explore, Catch, Cook – and create memories that will last a lifetime!
            </p>
          </div>

          {/* Image */}
          <img src={seafoodImage} alt="Cooking Seafood" className="w-full md:w-1/2 rounded-lg shadow-lg" />
        </div>

      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default About;
