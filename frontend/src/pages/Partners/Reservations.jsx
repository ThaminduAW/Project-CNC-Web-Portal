import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUsers, FaEnvelope, FaStore, FaTrash } from 'react-icons/fa';
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
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch('http://localhost:3000/api/reservations/partner', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data);
      setLoading(false);
    } catch (err) {
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

      fetchReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete reservation');
      }

      fetchReservations();
      setShowDetailsModal(false);
    } catch (err) {
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

  if (error) {
    return (
      <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
        <PartnerSideBar />
        <div className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#fdfcdcff] text-[#001524ff]">
      <PartnerSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Manage <span className="text-[#fea116ff]">Reservations</span>
        </h1>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, date, or time..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
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
        </div>

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
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
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-3 text-[#fea116ff]" />
                  <span>{new Date(reservation.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="mr-3 text-[#fea116ff]" />
                  <span>{reservation.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaUsers className="mr-3 text-[#fea116ff]" />
                  <span>{reservation.numberOfGuests} guests</span>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(reservation._id, 'confirmed');
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <FaCheck className="mr-2" /> Confirm
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(reservation._id, 'declined');
                    }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <FaTimes className="mr-2" /> Decline
                  </button>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(reservation._id);
                }}
                className="mt-4 w-full bg-gray-100 text-red-600 py-2 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Delete Reservation
              </button>
            </div>
          ))}
        </div>

        {/* Reservation Details Modal */}
        {showDetailsModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <FaStore className="mr-2 text-[#fea116ff]" />
                    Customer Information
                  </h3>
                  <p className="text-gray-600">{selectedReservation.customerName}</p>
                  <p className="text-gray-600">{selectedReservation.customerEmail}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#fea116ff]" />
                    Reservation Details
                  </h3>
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
                      <span>{selectedReservation.instructions || 'No special requests'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {selectedReservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReservation._id, 'confirmed');
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        <FaCheck className="mr-2" /> Confirm Reservation
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedReservation._id, 'declined');
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" /> Decline Reservation
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(selectedReservation._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-gray-100 text-red-600 py-3 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
                  >
                    <FaTrash className="mr-2" /> Delete Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations; 