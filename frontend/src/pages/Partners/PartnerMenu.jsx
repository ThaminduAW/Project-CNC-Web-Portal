import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUtensils, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import PartnerSideBar from '../../components/PartnerSideBar';

const PartnerMenu = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        const response = await axios.get(`http://localhost:3000/api/tours/partner/${partnerId}`, {
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

  // Fetch menu items for selected tour
  useEffect(() => {
    if (!selectedTour) return;
    setMenuItems([]);
    setLoading(true);
    setError(null);
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/partner/menu?tour=${selectedTour._id}`,
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
    const response = await axios.get(`http://localhost:3000/api/tours/${tourId}`,
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
      await axios.post('http://localhost:3000/api/partner/menu', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`http://localhost:3000/api/partner/menu?tour=${selectedTour._id}`,
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
      await axios.put(`http://localhost:3000/api/partner/menu/${editId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`http://localhost:3000/api/partner/menu?tour=${selectedTour._id}`,
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
      await axios.delete(`http://localhost:3000/api/partner/menu/${menuItems[idx]._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`http://localhost:3000/api/partner/menu?tour=${selectedTour._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
    } catch (err) {
      setError('Failed to delete menu item');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff] relative">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
        <h1 className="text-3xl font-bold mb-8">
          Manage <span className="text-[#fea116ff]">Menu</span>
        </h1>
        {/* Tour selection */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Tour</label>
          <select
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
            value={selectedTour?._id || ''}
            onChange={handleTourChange}
          >
            {tours.map(tour => (
              <option key={tour._id} value={tour._id}>
                {tour.title} ({new Date(tour.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setActiveTab(activeTab === 'view' ? 'add' : 'view')}
            className="bg-[#fea116ff] text-white px-4 py-2 rounded-md hover:bg-[#fea116cc] flex items-center gap-2 shadow"
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        ) : activeTab === 'view' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <span className="inline-block bg-[#fea116ff] text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-[#fea116ff]">${item.price}</span>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="bg-gray-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="bg-gray-100 text-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={editIndex !== null ? handleSaveEdit : handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Food Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#fea116ff] text-white py-2 px-4 rounded-md hover:bg-[#fea116cc] focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:ring-offset-2 font-semibold mt-6"
              >
                {editIndex !== null ? 'Save Changes' : 'Add Menu Item'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PartnerMenu;