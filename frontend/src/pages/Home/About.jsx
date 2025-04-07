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
      <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        
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
        <div className="bg-white p-6 md:p-10 mt-12 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-center">Why Choose CNC World Tour?</h2>
          <p className="text-gray-600 text-center mt-2">
            More than just a tour – it's an adventure that immerses you in the beauty of the ocean and the traditions of sustainable fishing.
          </p>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-[#fea116ff] text-white rounded-lg shadow-md text-center">
              <h3 className="font-semibold">🌊 Connect with Nature</h3>
              <p className="text-sm">Experience the thrill of catching fresh seafood in its natural habitat.</p>
            </div>
            <div className="p-4 bg-[#fea116ff] text-white rounded-lg shadow-md text-center">
              <h3 className="font-semibold">🍽 Culinary Mastery</h3>
              <p className="text-sm">Learn from expert chefs and turn your catch into a gourmet delight.</p>
            </div>
            <div className="p-4 bg-[#fea116ff] text-white rounded-lg shadow-md text-center">
              <h3 className="font-semibold">🌍 Sustainable Practices</h3>
              <p className="text-sm">Understand and embrace responsible fishing techniques for a better future.</p>
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
