import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCalendarAlt, FaTable, FaPlus } from 'react-icons/fa';
import AdminSideBar from "../../components/AdminSideBar";
import AdminCalendar from '../../components/AdminCalendar';
import { useNavigate } from 'react-router-dom';

const AdminPartnerTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTour, setNewTour] = useState({
    title: '',
    briefDescription: '',
    detailedDescription: '',
    timeDuration: '',
    location: '',
    price: 0,
    date: '',
    optionalDetails: '',
    status: 'active'
  });
  const [partners, setPartners] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTour, setEditTour] = useState(null);
  const navigate = useNavigate();

  // Add user check on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || user.role !== 'Admin') {
      navigate('/signin');
      return;
    }

    // Fetch tours and partners after verifying admin status
    fetchTours();
    fetchPartners();
  }, [navigate]);

  // Fetch partner tours
  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/tours", {
        headers: {
          'Authorization': `Bearer ${token}`
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

  // Fetch partners for the dropdown
  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/partners', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      const data = await response.json();
      setPartners(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get unique restaurant names for the filter
  const restaurantNames = [...new Set(tours.map(tour => tour.partner?.restaurantName))].filter(Boolean);

  // Sorting function
  const sortTours = (tours) => {
    if (!sortConfig.key) return tours;
    
    return [...tours].sort((a, b) => {
      if (!a || !b) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter tours based on all criteria
  const filteredTours = tours.filter(tour => {
    if (!tour) return false;
    
    const matchesRestaurant = selectedRestaurant === "all" || tour.partner?.restaurantName === selectedRestaurant;
    const matchesStatus = selectedStatus === "all" || tour.status === selectedStatus;
    const matchesSearch = searchQuery === "" || 
      (tour.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (tour.partner?.restaurantName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate && tour.date) {
      const tourDate = new Date(tour.date).toDateString();
      const filterDate = new Date(selectedDate).toDateString();
      matchesDate = tourDate === filterDate;
    }

    return matchesRestaurant && matchesStatus && matchesSearch && matchesDate;
  });

  // Sort filtered tours
  const sortedTours = sortTours(filteredTours);

  // Pagination
  const indexOfLastTour = currentPage * itemsPerPage;
  const indexOfFirstTour = indexOfLastTour - itemsPerPage;
  const currentTours = sortedTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(sortedTours.length / itemsPerPage);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle tour deletion
  const handleDelete = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      // Update the tours state by removing the deleted tour
      setTours(prevTours => prevTours.filter(tour => tour._id !== tourId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle calendar event click
  const handleEventClick = (event) => {
    // You can implement what happens when a calendar event is clicked
    console.log('Event clicked:', event);
  };

  // Handle tour creation
  const handleCreateTour = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!user || !token || user.role !== 'Admin') {
        console.error('Authentication error:', { user, hasToken: !!token });
        navigate('/signin');
        return;
      }

      if (!selectedImage) {
        throw new Error('Please select an image for the tour');
      }

      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // Add other tour data
      Object.keys(newTour).forEach(key => {
        formData.append(key, newTour[key]);
      });

      const response = await fetch('http://localhost:3000/api/tours', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        }
        throw new Error(errorData?.message || 'Failed to create tour');
      }

      const createdTour = await response.json();
      setTours(prevTours => [...prevTours, createdTour]);
      setShowCreateModal(false);
      setNewTour({
        title: '',
        briefDescription: '',
        detailedDescription: '',
        timeDuration: '',
        location: '',
        price: 0,
        date: '',
        optionalDetails: '',
        status: 'active'
      });
      setSelectedImage(null);
    } catch (err) {
      console.error('Error creating tour:', err);
      setError(err.message);
    }
  };

  const handleToggleStatus = async (tour) => {
    if (!tour) return;
    const token = localStorage.getItem('token');
    const newStatus = tour.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`http://localhost:3000/api/tours/${tour._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: (() => {
          const formData = new FormData();
          formData.append('status', newStatus);
          return formData;
        })()
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedTour = await response.json();
      setTours(prevTours => prevTours.map(t => t._id === updatedTour._id ? updatedTour : t));
      if (selectedTour && selectedTour._id === updatedTour._id) setSelectedTour(updatedTour);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div className="flex bg-[#fdfcdcff] min-h-screen">
      {/* Admin Sidebar */}
      <AdminSideBar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#001524ff]">Partner Tours</h1>
            <p className="text-gray-600">View and manage all tours organized by partner restaurants.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#0098c9ff] text-white px-4 py-2 rounded-md hover:bg-[#0088b9ff] flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create Tour</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-[#0098c9ff] text-white' : 'bg-gray-200'}`}
            >
              <FaTable className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-[#0098c9ff] text-white' : 'bg-gray-200'}`}
            >
              <FaCalendarAlt className="text-lg" />
            </button>
          </div>
        </div>

        {/* Create Tour Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-screen overflow-y-auto animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-[#001524ff] mb-6">Create New Tour</h2>
              <form onSubmit={handleCreateTour} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newTour.title}
                      onChange={(e) => setNewTour({...newTour, title: e.target.value})}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={newTour.status}
                      onChange={(e) => setNewTour({...newTour, status: e.target.value})}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    >
                      <option value="active">Available</option>
                      <option value="inactive">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newTour.date}
                      onChange={(e) => setNewTour({...newTour, date: e.target.value})}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newTour.location}
                      onChange={(e) => setNewTour({...newTour, location: e.target.value})}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={newTour.timeDuration}
                      onChange={(e) => setNewTour({...newTour, timeDuration: e.target.value})}
                      placeholder="e.g., 2 hours, Half day"
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={newTour.price}
                      onChange={(e) => setNewTour({...newTour, price: parseFloat(e.target.value)})}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brief Description</label>
                  <input
                    type="text"
                    value={newTour.briefDescription}
                    onChange={(e) => setNewTour({...newTour, briefDescription: e.target.value})}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                  <textarea
                    value={newTour.detailedDescription}
                    onChange={(e) => setNewTour({...newTour, detailedDescription: e.target.value})}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Details</label>
                  <textarea
                    value={newTour.optionalDetails}
                    onChange={(e) => setNewTour({...newTour, optionalDetails: e.target.value})}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    required
                  />
                  {selectedImage && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0098c9ff] text-white rounded-md hover:bg-[#0088b9ff] font-semibold shadow"
                  >
                    Create Tour
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Restaurant Filter */}
            <div>
              <label htmlFor="restaurant-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Restaurant:
              </label>
              <select
                id="restaurant-filter"
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              >
                <option value="all">All Restaurants</option>
                {restaurantNames.map((restaurant, index) => (
                  <option key={`restaurant-${index}-${restaurant}`} value={restaurant}>
                    {restaurant}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              />
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search:
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tours..."
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0098c9ff] focus:border-[#0098c9ff]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0098c9ff]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No tours found matching your criteria.</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <AdminCalendar 
            tours={filteredTours} 
            onEventClick={handleEventClick}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-[#0098c9ff] text-white">
                  <tr>
                    <th className="p-3 text-left">Tour Name</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTours.map((tour) => (
                    <tr key={tour._id} className="border-b hover:bg-gray-100 transition">
                      <td className="p-3 font-semibold text-[#001524ff]">{tour.title}</td>
                      <td className="p-3">{new Date(tour.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          className={`px-3 py-1 rounded-full text-sm font-medium focus:outline-none transition ${tour.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                          onClick={() => handleToggleStatus(tour)}
                          title={tour.status === 'active' ? 'Click to make unavailable' : 'Click to make available'}
                        >
                          {tour.status === 'active' ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="View"
                          onClick={() => { setSelectedTour(tour); setShowViewModal(true); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View
                        </button>
                        <button
                          className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          title="Edit"
                          onClick={() => { setEditTour(tour); setShowEditModal(true); }}
                        >
                          <FaEdit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tour._id)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={`page-${index + 1}`}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-[#0098c9ff] border-[#0098c9ff] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {showViewModal && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-[#001524ff] mb-6">Tour Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                <div>
                  <div className="text-gray-500 text-sm">Tour Name</div>
                  <div className="font-semibold text-lg">{selectedTour.title}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Date</div>
                  <div>{new Date(selectedTour.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTour.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedTour.status === 'active' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Location</div>
                  <div>{selectedTour.location}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-500 text-sm">Brief Description</div>
                  <div>{selectedTour.briefDescription}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-500 text-sm">Detailed Description</div>
                  <div>{selectedTour.detailedDescription}</div>
                </div>
                {selectedTour.optionalDetails && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 text-sm">Optional Details</div>
                    <div>{selectedTour.optionalDetails}</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 text-sm">Duration</div>
                  <div>{selectedTour.timeDuration}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Price</div>
                  <div>${selectedTour.price}</div>
                </div>
                {selectedTour.image && (
                  <div className="md:col-span-2 flex flex-col items-center mt-2">
                    <img
                      src={selectedTour.image.startsWith('/uploads') ? `http://localhost:3000${selectedTour.image}` : selectedTour.image}
                      alt="Tour"
                      className="h-40 w-40 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-screen overflow-y-auto animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-[#001524ff] mb-6">Edit Tour</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const token = localStorage.getItem('token');
                  try {
                    const formData = new FormData();
                    formData.append('title', editTour.title);
                    formData.append('briefDescription', editTour.briefDescription);
                    formData.append('detailedDescription', editTour.detailedDescription);
                    formData.append('timeDuration', editTour.timeDuration);
                    formData.append('location', editTour.location);
                    formData.append('price', editTour.price);
                    formData.append('date', editTour.date);
                    formData.append('optionalDetails', editTour.optionalDetails || '');
                    formData.append('status', editTour.status);
                    if (editTour.imageFile) formData.append('image', editTour.imageFile);
                    const response = await fetch(`http://localhost:3000/api/tours/${editTour._id}`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData
                    });
                    if (!response.ok) throw new Error('Failed to update tour');
                    const updatedTour = await response.json();
                    setTours(prevTours => prevTours.map(t => t._id === updatedTour._id ? updatedTour : t));
                    setShowEditModal(false);
                    setEditTour(null);
                  } catch (err) {
                    alert('Error updating tour: ' + err.message);
                  }
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Name</label>
                    <input
                      type="text"
                      value={editTour.title}
                      onChange={e => setEditTour({ ...editTour, title: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editTour.date?.slice(0, 10) || ''}
                      onChange={e => setEditTour({ ...editTour, date: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={editTour.status}
                      onChange={e => setEditTour({ ...editTour, status: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    >
                      <option value="active">Available</option>
                      <option value="inactive">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editTour.location}
                      onChange={e => setEditTour({ ...editTour, location: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={editTour.timeDuration}
                      onChange={e => setEditTour({ ...editTour, timeDuration: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={editTour.price}
                      onChange={e => setEditTour({ ...editTour, price: e.target.value })}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brief Description</label>
                  <input
                    type="text"
                    value={editTour.briefDescription}
                    onChange={e => setEditTour({ ...editTour, briefDescription: e.target.value })}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                  <textarea
                    value={editTour.detailedDescription}
                    onChange={e => setEditTour({ ...editTour, detailedDescription: e.target.value })}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Details</label>
                  <textarea
                    value={editTour.optionalDetails}
                    onChange={e => setEditTour({ ...editTour, optionalDetails: e.target.value })}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditTour({ ...editTour, imageFile: e.target.files[0] })}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098c9ff]"
                  />
                  {editTour.image && !editTour.imageFile && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={editTour.image.startsWith('/uploads') ? `http://localhost:3000${editTour.image}` : editTour.image}
                        alt="Tour"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {editTour.imageFile && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={URL.createObjectURL(editTour.imageFile)}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-8">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0098c9ff] text-white rounded-md hover:bg-[#0088b9ff] font-semibold shadow"
                  >
                    Save Changes
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

export default AdminPartnerTours; 