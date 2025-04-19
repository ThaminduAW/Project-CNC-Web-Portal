import React, { useState, useEffect } from 'react';
import PartnerSideBar from '../../components/PartnerSideBar';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaImage } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const PartnerTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    briefDescription: '',
    detailedDescription: '',
    timeDuration: '',
    location: '',
    price: '',
    image: null,
    date: '',
    optionalDetails: '',
    status: 'active'
  });

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?.id;
  };

  // Fetch tours
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const partnerId = getPartnerId();
        const token = localStorage.getItem('token');
        
        if (!partnerId || !token) {
          setError('Please login to access this page');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/tours/partner/${partnerId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }

        const data = await response.json();
        setTours(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle add tour
  const handleAddTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          if (formData.image) {
            formDataToSend.append('image', formData.image);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await fetch('http://localhost:3000/api/tours', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to add tour');
      }

      const newTour = await response.json();
      setTours([...tours, newTour]);
      setShowAddModal(false);
      setFormData({
        title: '',
        briefDescription: '',
        detailedDescription: '',
        timeDuration: '',
        location: '',
        price: '',
        image: null,
        date: '',
        optionalDetails: '',
        status: 'active'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit tour
  const handleEditTour = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          if (formData.image) {
            formDataToSend.append('image', formData.image);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await fetch(`http://localhost:3000/api/tours/${selectedTour._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update tour');
      }

      const updatedTour = await response.json();
      setTours(tours.map(tour => 
        tour._id === updatedTour._id ? updatedTour : tour
      ));
      setShowEditModal(false);
      setSelectedTour(null);
      setFormData({
        title: '',
        briefDescription: '',
        detailedDescription: '',
        timeDuration: '',
        location: '',
        price: '',
        image: null,
        date: '',
        optionalDetails: '',
        status: 'active'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete tour
  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      setTours(tours.filter(tour => tour._id !== tourId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (tourId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';
      
      const response = await fetch(`http://localhost:3000/api/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update tour status');
      }

      const updatedTour = await response.json();
      setTours(tours.map(tour => 
        tour._id === updatedTour._id ? updatedTour : tour
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Open edit modal
  const openEditModal = (tour) => {
    setSelectedTour(tour);
    setFormData({
      title: tour.title,
      briefDescription: tour.briefDescription,
      detailedDescription: tour.detailedDescription,
      timeDuration: tour.timeDuration,
      location: tour.location,
      price: tour.price,
      image: null,
      date: tour.date.split('T')[0],
      optionalDetails: tour.optionalDetails || '',
      status: tour.status
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <PartnerSideBar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff] relative">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#001524ff] tracking-tight">Manage Tours</h1>
              <p className="text-gray-600 mt-1">Create and manage your culinary tour experiences</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto bg-[#fea116ff] text-white px-6 py-3 rounded-lg hover:bg-[#e69510ff] transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaPlus className="text-lg" />
              <span>Add New Tour</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {tours.map((tour) => (
              <div key={tour._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getImageUrl(tour.image)}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={handleImageError}
                  />
                  <div className="absolute top-4 right-4 bg-[#fea116ff] text-white px-4 py-1.5 rounded-full shadow-md font-semibold">
                    ${tour.price}
                  </div>
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                    tour.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tour.status}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#001524ff] mb-3 line-clamp-1">{tour.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{tour.briefDescription}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaClock className="w-4 h-4 mr-3 text-[#fea116ff]" />
                      <span className="line-clamp-1">{tour.timeDuration}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaCalendarAlt className="w-4 h-4 mr-3 text-[#fea116ff]" />
                      <span className="line-clamp-1">{new Date(tour.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaMapMarkerAlt className="w-4 h-4 mr-3 text-[#fea116ff]" />
                      <span className="line-clamp-1">{tour.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleAvailability(tour._id, tour.status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-grow text-center ${
                        tour.status === 'active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {tour.status === 'active' ? 'Make Unavailable' : 'Make Available'}
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(tour)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit Tour"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Tour"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Tour Modal */}
          {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                  <h2 className="text-2xl font-bold text-[#001524ff]">
                    {showAddModal ? 'Add New Tour' : 'Edit Tour'}
                  </h2>
                  <button
                    onClick={() => {
                      showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                      setSelectedTour(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={showAddModal ? handleAddTour : handleEditTour} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tour Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brief Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="briefDescription"
                        value={formData.briefDescription}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                        rows="2"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detailed Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="detailedDescription"
                        value={formData.detailedDescription}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                        rows="4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Duration <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="timeDuration"
                          value={formData.timeDuration}
                          onChange={handleChange}
                          placeholder="e.g., 2 hours, Half day"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tour Image {!showEditModal && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FaImage className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
                            </div>
                            <input
                              type="file"
                              name="image"
                              onChange={handleChange}
                              className="hidden"
                              accept="image/*"
                              required={!showEditModal}
                            />
                          </label>
                        </div>
                      </div>
                      {showEditModal && (
                        <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Optional Details
                      </label>
                      <textarea
                        name="optionalDetails"
                        value={formData.optionalDetails}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                        rows="3"
                        placeholder="Additional information about the tour"
                      />
                    </div>
                  </div>

                  {/* If editing, show current image preview */}
                  {showEditModal && selectedTour && selectedTour.image && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Image</label>
                      <img
                        src={getImageUrl(selectedTour.image)}
                        alt="Current tour"
                        className="w-full max-h-48 object-cover rounded-lg"
                        onError={handleImageError}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-6 border-t sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                        setSelectedTour(null);
                      }}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>{showAddModal ? 'Add Tour' : 'Update Tour'}</span>
                      {showAddModal ? <FaPlus /> : <FaEdit />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerTours;