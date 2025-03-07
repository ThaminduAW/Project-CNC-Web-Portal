import Hero from "../../components/Hero";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />
      <Hero />

      {/* Featured Restaurants Section */}
      <section className="py-12 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-center">Explore Our Partner Restaurants</h2>
        <p className="text-center text-gray-600 mt-2">Experience the best seafood dishes around the world.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Sample Restaurant Cards */}
          {["Ocean Breeze", "Fisherman’s Delight", "Seaside Bites"].map((restaurant, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition">
              <h3 className="text-xl font-semibold">{restaurant}</h3>
              <p className="text-gray-600">Authentic seafood experience.</p>
              <a href="/restaurants" className="mt-3 inline-block bg-[#0098c9ff] text-white px-4 py-2 rounded-md hover:bg-[#0079a1ff] transition">
                View More
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 px-6 md:px-12 bg-[#0098c9ff] text-white text-center">
        <h2 className="text-3xl font-bold">Why Choose CNC World Tour?</h2>
        <p className="mt-2 text-lg">Your ultimate seafood adventure starts here.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Top Chefs</h3>
            <p>Learn from world-renowned seafood chefs.</p>
          </div>
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Exclusive Tours</h3>
            <p>Book seafood excursions in exotic locations.</p>
          </div>
          <div className="p-6 bg-white text-[#001524ff] rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Sustainable Fishing</h3>
            <p>Enjoy seafood responsibly with eco-friendly practices.</p>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Home;
