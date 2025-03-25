import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUsers, FaEnvelope } from 'react-icons/fa';
import PartnerSideBar from '../../components/PartnerSideBar';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token); // Log if token exists

      if (!token) {
        console.log('No token found, redirecting to signin');
        navigate('/signin');
        return;
      }

      console.log('Fetching reservations from:', 'http://localhost:3000/api/reservations/partner');
      const response = await fetch('http://localhost:3000/api/reservations/partner', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to signin');
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/signin');
          return;
        }
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        
        if (errorData.message === 'Partner not found') {
          throw new Error('Your partner account could not be found. Please try signing in again.');
        }
        
        throw new Error(errorData.message || 'Failed to fetch reservations');
      }

      const data = await response.json();
      console.log('Received reservations:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      
      setReservations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reservation status');
      }

      // Refresh reservations after update
      fetchReservations();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      setError(err.message);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.date.includes(searchTerm) ||
                         reservation.time.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex">
      <PartnerSideBar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Reservations Management</h1>
        
        {/* Search and Filter Section */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, date, or time..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedReservation(reservation);
                setShowDetailsModal(true);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{reservation.customerName}</h3>
                  <p className="text-sm text-gray-500">{reservation.customerEmail}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  <span>{new Date(reservation.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-2" />
                  <span>{reservation.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  <span>{reservation.numberOfGuests} guests</span>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(reservation._id, 'confirmed');
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    <FaCheck className="inline-block mr-1" /> Confirm
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(reservation._id, 'declined');
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="inline-block mr-1" /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reservation Details Modal */}
        {showDetailsModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Reservation Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Customer Information</h3>
                  <p className="text-gray-600">{selectedReservation.customerName}</p>
                  <p className="text-gray-600">{selectedReservation.customerEmail}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Reservation Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>{new Date(selectedReservation.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>{selectedReservation.time}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-gray-500" />
                      <span>{selectedReservation.numberOfGuests} guests</span>
                    </div>
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      <span>{selectedReservation.specialRequests || 'No special requests'}</span>
                    </div>
                  </div>
                </div>

                {selectedReservation.status === 'pending' && (
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReservation._id, 'confirmed');
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      <FaCheck className="inline-block mr-1" /> Confirm Reservation
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReservation._id, 'declined');
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      <FaTimes className="inline-block mr-1" /> Decline Reservation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations; 