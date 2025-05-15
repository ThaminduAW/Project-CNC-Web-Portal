import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUtensils, FaEdit, FaCheck, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import PartnerSideBar from '../../components/PartnerSideBar';
import { baseURL } from '../../utils/baseURL';

const PartnerMenu = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [tours, setTours] = useState([]);
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailableTours, setLoadingAvailableTours] = useState(false);
  const [joiningTour, setJoiningTour] = useState(null);
  const [error, setError] = useState(null);
  const [showAvailableTours, setShowAvailableTours] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const CATEGORY_LABELS = {
    appetizer: 'Appetizer',
    main: 'Main Course',
    dessert: 'Dessert',
    beverage: 'Beverage'
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main'
  });

  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id;
  };

  // Fetch tours for this partner
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const partnerId = getPartnerId();
        const response = await axios.get(`${baseURL}/tours/partner/${partnerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTours(response.data);
        if (response.data.length > 0) {
          setSelectedTour(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Fetch available tours
  const fetchAvailableTours = async () => {
    setLoadingAvailableTours(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await axios.get(`${baseURL}/tours/available`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setAvailableTours(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching available tours:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view available tours.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to fetch available tours. Please try again later.');
      }
      
      setAvailableTours([]);
    } finally {
      setLoadingAvailableTours(false);
    }
  };

  // Handle joining a tour
  const handleJoinTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to join this tour?')) return;
    
    setJoiningTour(tourId);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      await axios.post(
        `${baseURL}/tours/${tourId}/partner`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh tours list
      const partnerId = getPartnerId();
      const response = await axios.get(
        `${baseURL}/tours/partner/${partnerId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTours(response.data);
      setShowAvailableTours(false);
      setError(null);
    } catch (err) {
      console.error('Error joining tour:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('You do not have permission to join this tour.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to join tour. Please try again later.');
      }
    } finally {
      setJoiningTour(null);
    }
  };

  // Fetch menu items for selected tour
  useEffect(() => {
    if (!selectedTour) return;
    setMenuItems([]);
    setLoading(true);
    setError(null);
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/partner/menu?tour=${selectedTour._id}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setMenuItems(response.data);
      } catch (err) {
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [selectedTour]);

  // Helper to fetch a tour by ID
  const fetchTourById = async (tourId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${baseURL}/tours/${tourId}`,
      { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  };

  const handleTourChange = (e) => {
    const tour = tours.find(t => t._id === e.target.value);
    setSelectedTour(tour);
    setActiveTab('view');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {} // No-op

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const partnerId = getPartnerId();
      const payload = {
        ...formData,
        price: Number(formData.price),
        tour: selectedTour?._id
      };
      console.log('Adding menu item:', payload); // Debug log
      await axios.post(`${baseURL}/partner/menu`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?tour=${selectedTour._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
      setFormData({ name: '', description: '', price: '', category: 'main' });
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add menu item');
    }
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditId(menuItems[idx]._id);
    setFormData({
      name: menuItems[idx].name,
      description: menuItems[idx].description,
      price: menuItems[idx].price,
      category: menuItems[idx].category
    });
    setActiveTab('add');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${baseURL}/partner/menu/${editId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?tour=${selectedTour._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
      setFormData({ name: '', description: '', price: '', category: 'main' });
      setEditIndex(null);
      setEditId(null);
      setActiveTab('view');
    } catch (err) {
      setError('Failed to update menu item');
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseURL}/partner/menu/${menuItems[idx]._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?tour=${selectedTour._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
    } catch (err) {
      setError('Failed to delete menu item');
    }
  };

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  // Handle leaving a tour
  const [leavingTour, setLeavingTour] = useState(null);
  const handleLeaveTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to leave this tour?')) return;
    setLeavingTour(tourId);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      await axios.delete(`${baseURL}/tours/${tourId}/partner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh tours list
      const partnerId = getPartnerId();
      const response = await axios.get(
        `${baseURL}/tours/partner/${partnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTours(response.data);
      // If the current selected tour was left, select another or null
      if (selectedTour && selectedTour._id === tourId) {
        setSelectedTour(response.data[0] || null);
      }
      setError(null);
    } catch (err) {
      console.error('Error leaving tour:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to leave this tour.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to leave tour. Please try again later.');
      }
    } finally {
      setLeavingTour(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff]  relative">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage <span className="text-[#fea116ff]">Menu</span>
            </h1>
            <button
              onClick={() => {
                setShowAvailableTours(!showAvailableTours);
                if (!showAvailableTours) {
                  fetchAvailableTours();
                }
              }}
              className="bg-[#fea116ff] text-white px-6 py-3 rounded-lg hover:bg-[#fea116cc] flex items-center gap-2 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <FaPlus /> {showAvailableTours ? 'Hide Available Tours' : 'Show Available Tours'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Available Tours Section */}
          {showAvailableTours && (
            <div className="bg-gray-50 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Available Tours</h2>
              {loadingAvailableTours ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
                </div>
              ) : availableTours.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available tours</h3>
                  <p className="mt-1 text-sm text-gray-500">Check back later for new tour opportunities.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTours.map(tour => (
                    <div key={tour._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      {tour.image && (
                        <div className="relative h-48">
                          <img 
                            src={tour.image} 
                            alt={tour.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900 shadow">
                            ${tour.price}
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{tour.briefDescription}</p>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>{new Date(tour.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaMapMarkerAlt className="mr-2" />
                            <span>{tour.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2" />
                            <span>{tour.timeDuration}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaUsers className="mr-2" />
                            <span>{tour.availableSpots} spots available</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinTour(tour._id)}
                          disabled={tour.isFull || joiningTour === tour._id}
                          className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                            tour.isFull 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : joiningTour === tour._id
                              ? 'bg-[#fea116cc] text-white'
                              : 'bg-[#fea116ff] hover:bg-[#fea116cc] text-white'
                          }`}
                        >
                          {joiningTour === tour._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Joining...
                            </>
                          ) : tour.isFull ? (
                            'Tour Full'
                          ) : (
                            <>
                              <FaCheck /> Join Tour
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tour Selection */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tour</label>
            <div className="flex gap-4 items-center">
              <select
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent text-base font-medium shadow-sm transition-all duration-300"
                value={selectedTour?._id || ''}
                onChange={handleTourChange}
                aria-label="Select Tour"
              >
                {tours.map(tour => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title} ({new Date(tour.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {selectedTour && (
                <button
                  onClick={() => handleLeaveTour(selectedTour._id)}
                  disabled={leavingTour === selectedTour._id}
                  aria-label="Leave selected tour"
                  className={`h-[48px] px-10 py-3 rounded-lg flex items-center gap-2 font-semibold text-base shadow-lg transition-all duration-300 bg-red-500 text-white hover:bg-red-600 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${leavingTour === selectedTour._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {leavingTour === selectedTour._id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Leaving...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Leave Tour
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Menu Management */}
          <div className="bg-gray-50 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Menu Items</h2>
              <button
                onClick={() => setActiveTab(activeTab === 'view' ? 'add' : 'view')}
                className="bg-[#fea116ff] text-white px-6 py-3 rounded-lg hover:bg-[#fea116cc] flex items-center gap-2 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                {activeTab === 'view' ? (
                  <>
                    <FaPlus /> Add New Item
                  </>
                ) : (
                  <>
                    <FaUtensils /> View Menu
                  </>
                )}
              </button>
            </div>

            {activeTab === 'view' ? (
              <>
                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-[#fea116ff] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Items
                  </button>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === key
                          ? 'bg-[#fea116ff] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grid */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new menu item.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenuItems.map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <span className="inline-block bg-[#fea116ff] text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(idx)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(idx)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-[#fea116ff]">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={editIndex !== null ? handleSaveEdit : handleSubmit} className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Food Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#fea116ff] text-white py-3 px-4 rounded-lg hover:bg-[#fea116cc] focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:ring-offset-2 font-semibold transition-all duration-300"
                  >
                    {editIndex !== null ? 'Save Changes' : 'Add Menu Item'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerMenu;