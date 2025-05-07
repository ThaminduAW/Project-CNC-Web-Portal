import React, { useState, useEffect } from 'react';
import PartnerSideBar from '../../components/PartnerSideBar';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaImage, FaUtensils } from 'react-icons/fa';
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
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: null
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

  // Handle menu item input changes
  const handleMenuItemChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setNewMenuItem(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setNewMenuItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add new menu item
  const handleAddMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      setError('Name and price are required');
      return;
    }

    setMenuItems([...menuItems, { ...newMenuItem }]);
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      image: null
    });
  };

  // Remove menu item
  const handleRemoveMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  // Save menu
  const handleSaveMenu = async () => {
    try {
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/tours/${selectedTour._id}/menu/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ menu: menuItems })
      });

      if (!response.ok) {
        throw new Error('Failed to update menu');
      }

      const updatedTour = await response.json();
      setTours(tours.map(tour => 
        tour._id === updatedTour._id ? updatedTour : tour
      ));
      setShowMenuModal(false);
      setSelectedTour(null);
      setMenuItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open menu modal
  const openMenuModal = (tour) => {
    const restaurant = tour.restaurants.find(r => r.restaurant._id === getPartnerId());
    setSelectedTour(tour);
    setMenuItems(restaurant?.menu || []);
    setShowMenuModal(true);
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
              <h1 className="text-2xl md:text-3xl font-bold text-[#001524ff] tracking-tight">My Tour Menus</h1>
              <p className="text-gray-600 mt-1">Manage your menus for tours assigned to your restaurant</p>
            </div>
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

                  <button
                    onClick={() => openMenuModal(tour)}
                    className="w-full bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#e69510ff] transition-all duration-200 flex items-center justify-center space-x-2 mt-4"
                  >
                    <FaUtensils className="text-lg" />
                    <span>Manage Menu</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Menu Modal */}
          {showMenuModal && selectedTour && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                  <h2 className="text-2xl font-bold text-[#001524ff]">
                    Manage Menu for {selectedTour.title}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMenuModal(false);
                      setSelectedTour(null);
                      setMenuItems([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Add New Menu Item Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Add New Menu Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newMenuItem.name}
                        onChange={handleMenuItemChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newMenuItem.price}
                        onChange={handleMenuItemChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newMenuItem.description}
                        onChange={handleMenuItemChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        rows="2"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleMenuItemChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddMenuItem}
                    className="mt-4 bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#e69510ff] transition-all duration-200"
                  >
                    Add Item
                  </button>
                </div>

                {/* Menu Items List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Menu Items</h3>
                  {menuItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-[#fea116ff] font-medium">${item.price}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMenuItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t sticky bottom-0 bg-white">
                  <button
                    onClick={() => {
                      setShowMenuModal(false);
                      setSelectedTour(null);
                      setMenuItems([]);
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMenu}
                    className="px-6 py-2.5 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200"
                  >
                    Save Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerTours;