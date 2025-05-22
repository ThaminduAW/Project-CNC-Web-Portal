import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { baseURL } from "../../utils/baseURL";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ success: false, error: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, error: "" });

    try {
      const response = await fetch(`${baseURL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      setStatus({ success: true, error: "" });
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setStatus({ success: false, error: "" }), 3000);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setStatus({ success: false, error: err.message });
    }
  };

  return (
    <div className="bg-[#fdfcdcff] text-[#001524ff]">
      <Header />

      <div className="container mx-auto px-6 md:px-12 py-12 max-w-5xl pt-30">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Get in Touch with <span className="text-[#fea116ff]">CNC World Tour</span>
        </h1>
        <p className="text-center text-gray-600 text-lg mt-3">
          We'd love to hear from you! Fill out the form below or contact us directly.
        </p>

        <div className="flex flex-col md:flex-row mt-10">
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="text-gray-600 mt-2">Feel free to reach out via email, phone, or visit us.</p>
            <div className="mt-4 space-y-3">
              <p className="text-[#fea116ff] font-semibold">📍 Address:</p>
              <p className="text-gray-600">
                IIBIT - Federation University Australia, Adelaide Campus
                <br />
                6/127 Rundle Mall, Adelaide SA 5000
              </p>
              <p className="text-[#fea116ff] font-semibold">📧 Email:</p>
              <p className="text-gray-600">contact@cncworldtour.com</p>
              <p className="text-[#fea116ff] font-semibold">📞 Phone:</p>
              <p className="text-gray-600">+1 234 567 890</p>
            </div>
          </div>

          <div className="md:w-1/2 mt-8 md:mt-0 md:ml-10 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold">Send Us a Message</h2>

            {status.success && (
              <p className="text-green-500 text-center mt-4">✅ Message sent successfully!</p>
            )}
            {status.error && (
              <p className="text-red-500 text-center mt-4">❌ {status.error}</p>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                className="w-full px-4 py-2 border rounded-md" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />

              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                className="w-full px-4 py-2 border rounded-md" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />

              <textarea 
                name="message" 
                placeholder="Your Message" 
                rows="4" 
                className="w-full px-4 py-2 border rounded-md" 
                value={formData.message} 
                onChange={handleChange} 
                required 
              />

              <button 
                type="submit" 
                className="w-full bg-[#fea116ff] text-white py-2 rounded-md hover:bg-[#e69510ff] transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps Location */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-center">Our Location</h2>
          <p className="text-center text-gray-600 mb-6">
            Visit us at our campus or explore our seafood destinations.
          </p>
          <div className="w-full h-64 md:h-96 rounded-lg shadow-lg overflow-hidden">
            <iframe
              title="CNC Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              className="rounded-lg"
              src="https://maps.google.com/maps?q=IIBIT%20Federation%20University%20Australia,%206/127%20Rundle%20Mall,%20Adelaide%20SA%205000&t=&z=15&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
