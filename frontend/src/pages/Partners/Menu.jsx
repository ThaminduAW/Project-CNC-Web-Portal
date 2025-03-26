import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaImage, FaCalendar, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Menu = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    images: [],
    availableDates: []
  });
  const [errors, setErrors] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);

  // Function to check storage usage
  const checkStorageUsage = () => {
    try {
      const total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      // If we're using more than 80% of storage, show warning
      if (total > 4 * 1024 * 1024) { // 4MB threshold
        setStorageWarning(true);
      } else {
        setStorageWarning(false);
      }
    } catch (error) {
      console.error('Error checking storage usage:', error);
    }
  };

  // Function to clean up old experiences
  const cleanupOldExperiences = () => {
    try {
      const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
      // Keep only the 20 most recent experiences
      const recentExperiences = storedExperiences
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);
      localStorage.setItem('experiences', JSON.stringify(recentExperiences));
      setExperiences(recentExperiences);
    } catch (error) {
      console.error('Error cleaning up experiences:', error);
    }
  };

  useEffect(() => {
    const loadExperiences = () => {
      try {
        const storedExperiences = JSON.parse(localStorage.getItem('experiences') || '[]');
        setExperiences(storedExperiences);
        checkStorageUsage();
      } catch (error) {
        console.error('Error loading experiences:', error);
      }
    };

    loadExperiences();
    window.addEventListener('storage', loadExperiences);
    return () => window.removeEventListener('storage', loadExperiences);
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(images => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...images]
        }));
      })
      .catch(error => {
        console.error('Error uploading images:', error);
        setErrors(prev => ({
          ...prev,
          images: 'Error uploading images. Please try again.'
        }));
      });
  };

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      }
      return [...prev, dateStr];
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (selectedDates.length === 0) newErrors.dates = 'At least one date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newExperience = {
      id: Date.now().toString(),
      ...formData,
      availableDates: selectedDates.map(date => new Date(date)),
      createdAt: new Date().toISOString()
    };

    try {
      const updatedExperiences = [...experiences, newExperience];
      localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
      setExperiences(updatedExperiences);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        price: '',
        images: [],
        availableDates: []
      });
      setSelectedDates([]);
      setErrors({});
      checkStorageUsage();
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // If storage is full, try to clean up old experiences
        cleanupOldExperiences();
        // Try to save again after cleanup
        try {
          const updatedExperiences = [...experiences, newExperience];
          localStorage.setItem('experiences', JSON.stringify(updatedExperiences));
          setExperiences(updatedExperiences);
          setShowForm(false);
          setFormData({
            title: '',
            description: '',
            location: '',
            price: '',
            images: [],
            availableDates: []
          });
          setSelectedDates([]);
          setErrors({});
        } catch (retryError) {
          setErrors(prev => ({
            ...prev,
            submit: 'Unable to save experience. Please try again later or contact support.'
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'An error occurred while saving the experience. Please try again.'
        }));
      }
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            Create New Experience
          </button>
        </div>

        {storageWarning && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Storage space is running low. Some older experiences may be automatically removed to make space for new ones.
                </p>
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Create New Experience</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="cursor-pointer bg-gray-50 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100">
                    <FaImage className="inline-block mr-2" />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available Dates</label>
                <div className="mt-1">
                  <input
                    type="date"
                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {errors.dates && <p className="mt-1 text-sm text-red-600">{errors.dates}</p>}
                {selectedDates.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDates.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {new Date(date).toLocaleDateString()}
                        <button
                          type="button"
                          onClick={() => setSelectedDates(prev => prev.filter((_, i) => i !== index))}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Experience
                </button>
              </div>
            </form>
          </motion.div>
        )}

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
      </div>
    </div>
  );
};

export default Menu;