import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);

  useEffect(() => {
    const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const foundExperience = storedExperiences.find(exp => exp.id === id);
    if (foundExperience) {
      setExperience(foundExperience);
    } else {
      navigate('/'); // Redirect to home if experience not found
    }
  }, [id, navigate]);

  if (!experience) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{experience.title}</h1>
        <p className="text-gray-600 mb-4">{experience.description}</p>
        <div className="mb-4">
          <span className="text-blue-600 font-semibold">${experience.price}</span>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p>{experience.location}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Available Dates</h2>
          <ul>
            {experience.availableDates.map((date, index) => (
              <li key={index}>{new Date(date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {experience.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Experience ${index + 1}`}
              className="h-32 w-full object-cover rounded-md"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceDetails;