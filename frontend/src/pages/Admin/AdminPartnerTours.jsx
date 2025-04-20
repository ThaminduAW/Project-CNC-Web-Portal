import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCalendarAlt, FaTable } from 'react-icons/fa';
import AdminSideBar from "../../components/AdminSideBar";
import AdminCalendar from '../../components/AdminCalendar';

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

  // Fetch partner tours
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/tours");
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
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('title')}>
                      Tour Name {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('partner.restaurantName')}>
                      Restaurant {sortConfig.key === 'partner.restaurantName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('date')}>
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('price')}>
                      Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left cursor-pointer hover:bg-[#0088b9ff]" onClick={() => handleSort('status')}>
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTours.map((tour) => (
                    <tr key={tour._id} className="border-b hover:bg-gray-100 transition">
                      <td className="p-3">{tour.title}</td>
                      <td className="p-3">{tour.partner?.restaurantName}</td>
                      <td className="p-3">{new Date(tour.date).toLocaleDateString()}</td>
                      <td className="p-3">${tour.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          tour.status === 'active' ? 'bg-green-100 text-green-800' :
                          tour.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tour.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="text-[#0098c9ff] hover:text-[#001524ff] mr-2">
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(tour._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
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
      </div>
    </div>
  );
};

export default AdminPartnerTours; 