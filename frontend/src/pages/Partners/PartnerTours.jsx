import React, { useState, useEffect } from 'react';
import PartnerSideBar from '../../components/PartnerSideBar';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const PartnerTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    image: null,
    date: '',
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
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          formDataToSend.append('image', formData.image);
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
        description: '',
        location: '',
        price: '',
        image: null,
        date: '',
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
        if (key === 'image' && formData.image) {
          formDataToSend.append('image', formData.image);
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
        description: '',
        location: '',
        price: '',
        image: null,
        date: '',
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
      description: tour.description,
      location: tour.location,
      price: tour.price,
      image: null,
      date: tour.date.split('T')[0],
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
    <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Tour</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#fea116ff] text-white px-4 py-2 rounded-md hover:bg-[#e69510ff] transition flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Tour
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Tour List */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0098c9ff] text-white">
                <th className="p-3">Tour Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Date</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">{tour.title}</td>
                  <td className="p-3">{tour.description}</td>
                  <td className="p-3">{new Date(tour.date).toLocaleDateString()}</td>
                  <td className="p-3">${tour.price}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tour.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tour.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleAvailability(tour._id, tour.status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                          tour.status === 'active'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {tour.status === 'active' ? 'Make Unavailable' : 'Make Available'}
                      </button>
                      <button
                        onClick={() => openEditModal(tour)}
                        className="px-4 py-2 bg-[#0098c9ff] text-white rounded-lg hover:bg-[#0087b8ff] transition-all duration-200 font-medium flex items-center shadow-sm hover:shadow-md"
                      >
                        <FaEdit className="mr-2 text-lg" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center shadow-sm hover:shadow-md"
                      >
                        <FaTrash className="mr-2 text-lg" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Tour Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#001524ff]">Add New Tour</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleAddTour} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Image <span className="text-red-500">*</span></label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    accept="image/*"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-colors duration-200"
                  >
                    Add Tour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Tour Modal */}
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#001524ff]">Edit Tour</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTour(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleEditTour} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tour Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTour(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-colors duration-200"
                  >
                    Update Tour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerTours;