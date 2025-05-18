import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUtensils, FaEdit, FaCheck, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaDollarSign, FaUsers, FaFish, FaPepperHot, FaImage } from 'react-icons/fa';
import axios from 'axios';
import PartnerSideBar from '../../components/PartnerSideBar';
import { baseURL } from '../../utils/baseURL';

const PartnerMenu = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const SPICY_LEVELS = {
    none: 'Not Spicy',
    mild: 'Mild',
    medium: 'Medium',
    hot: 'Hot',
    extraHot: 'Extra Hot'
  };

  const DIETARY_TAGS = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten Free',
    dairyFree: 'Dairy Free',
    nutFree: 'Nut Free',
    halal: 'Halal',
    keto: 'Keto'
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    ingredients: [],
    price: '',
    spicyLevel: 'none',
    dietaryTags: [],
    category: 'main'
  });

  const [editIndex, setEditIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [newIngredient, setNewIngredient] = useState('');

  // Get partner ID from localStorage
  const getPartnerId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?._id || user?.id;
  };

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const partnerId = getPartnerId();
        const response = await axios.get(`${baseURL}/partner/menu?partner=${partnerId}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setMenuItems(response.data);
      } catch (err) {
        setError('Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleDietaryTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const partnerId = getPartnerId();
      const payload = {
        ...formData,
        price: Number(formData.price),
        partner: partnerId
      };
      await axios.post(`${baseURL}/partner/menu`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?partner=${partnerId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
      setFormData({
        name: '',
        description: '',
        image: '',
        ingredients: [],
        price: '',
        spicyLevel: 'none',
        dietaryTags: [],
        category: 'main'
      });
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
      image: menuItems[idx].image || '',
      ingredients: menuItems[idx].ingredients || [],
      price: menuItems[idx].price,
      spicyLevel: menuItems[idx].spicyLevel || 'none',
      dietaryTags: menuItems[idx].dietaryTags || [],
      category: menuItems[idx].category || 'main'
    });
    setActiveTab('add');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const partnerId = getPartnerId();
      await axios.put(`${baseURL}/partner/menu/${editId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?partner=${partnerId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
      setFormData({
        name: '',
        description: '',
        image: '',
        ingredients: [],
        price: '',
        spicyLevel: 'none',
        dietaryTags: [],
        category: 'main'
      });
      setEditIndex(null);
      setEditId(null);
      setActiveTab('view');
    } catch (err) {
      setError('Failed to update menu item');
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const token = localStorage.getItem('token');
      const partnerId = getPartnerId();
      await axios.delete(`${baseURL}/partner/menu/${menuItems[idx]._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh menu items
      const response = await axios.get(`${baseURL}/partner/menu?partner=${partnerId}`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
    } catch (err) {
      setError('Failed to delete menu item');
    }
  };

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.imageUrl) {
        setFormData(prev => ({
          ...prev,
          image: response.data.imageUrl
        }));
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff] relative">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage <span className="text-[#fea116ff]">Restaurant Menu</span>
            </h1>
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
                    <FaPlus /> Add New Dish
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
                    All Services
                  </button>
                  {Object.entries(SPICY_LEVELS).map(([key, label]) => (
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
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new dish to your menu.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenuItems.map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        {item.image && (
                          <div className="relative h-48">
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image load error:', e);
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
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
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600">
                              <FaDollarSign className="mr-2" />
                              <span>${item.price}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaPepperHot className="mr-2" />
                              <span>Spicy Level: {SPICY_LEVELS[item.spicyLevel]}</span>
                            </div>
                          </div>

                          {item.ingredients && item.ingredients.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients:</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.ingredients.map((ingredient, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.dietaryTags && item.dietaryTags.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Tags:</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.dietaryTags.map((tag, i) => (
                                  <span key={i} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                    {DIETARY_TAGS[tag]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dish Name</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spicy Level</label>
                    <select
                      name="spicyLevel"
                      value={formData.spicyLevel}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                    >
                      {Object.entries(SPICY_LEVELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="Add an ingredient"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#fea116cc]"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(DIETARY_TAGS).map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.dietaryTags.includes(key)}
                            onChange={() => handleDietaryTagChange(key)}
                            className="rounded border-gray-300 text-[#fea116ff] focus:ring-[#fea116ff]"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dish Image</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0">
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Dish preview"
                            className="h-32 w-32 object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FaImage className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fea116ff] cursor-pointer"
                        >
                          Change Image
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#fea116ff] text-white py-3 px-4 rounded-lg hover:bg-[#fea116cc] focus:outline-none focus:ring-2 focus:ring-[#fea116ff] focus:ring-offset-2 font-semibold transition-all duration-300"
                  >
                    {editIndex !== null ? 'Save Changes' : 'Add Dish'}
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