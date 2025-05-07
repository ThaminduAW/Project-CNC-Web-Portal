import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUsers, FaEnvelope, FaStore, FaTrash, FaCalendarPlus, FaEdit } from 'react-icons/fa';
import PartnerSideBar from '../../components/PartnerSideBar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { baseURL } from '../../utils/baseURL';

const Reservations = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    startTime: '',
    endTime: '',
    isAvailable: true
  });
  const [showCustomTimeSlotModal, setShowCustomTimeSlotModal] = useState(false);
  const [customTimeSlot, setCustomTimeSlot] = useState({
    startTime: '',
    endTime: '',
    isAvailable: true,
    maxCapacity: 1,
    price: 0,
    description: ''
  });
  const [showEditTimeSlotModal, setShowEditTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    } else {
      fetchAvailability();
    }
  }, [activeTab, selectedDate]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${baseURL}/reservations/partner`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
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

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('User Data:', userData); // Debug log

      // Check for either id or _id
      const userId = userData?.id || userData?._id;
      if (!userId) {
        console.error('User data missing:', userData); // Debug log
        throw new Error('User data not found. Please sign in again.');
      }

      const response = await fetch(`${baseURL}/availability/${userId}/${format(selectedDate, 'yyyy-MM-dd')}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch availability error:', errorData); // Debug log
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.message || 'Failed to fetch availability');
      }

      const data = await response.json();
      console.log('Fetched availability:', data); // Debug log
      setAvailability(data.timeSlots || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch availability error:', err); // Debug log
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

      const response = await fetch(`${baseURL}/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
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

      const response = await fetch(`${baseURL}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.message || 'Failed to delete reservation');
      }

      fetchReservations();
      setShowDetailsModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('User Data for regular slot:', userData); // Debug log

      // Check for either id or _id
      const userId = userData?.id || userData?._id;
      if (!userId) {
        console.error('User data missing for regular slot:', userData); // Debug log
        throw new Error('User data not found. Please sign in again.');
      }

      // Validate time slot data before sending
      if (!newAvailability.startTime || !newAvailability.endTime) {
        throw new Error('Start time and end time are required');
      }

      const timeSlotData = {
        restaurantId: userId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: {
          ...newAvailability,
          maxCapacity: 1,
          price: 0,
          description: ''
        }
      };

      console.log('Sending regular time slot data:', timeSlotData); // Debug log

      const response = await fetch(`${baseURL}/availability/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeSlotData)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add availability');
      }

      setShowAvailabilityModal(false);
      setNewAvailability({
        startTime: '',
        endTime: '',
        isAvailable: true
      });
      fetchAvailability();
    } catch (err) {
      console.error('Add regular time slot error:', err); // Debug log
      setError(err.message);
    }
  };

  const handleAddCustomTimeSlot = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      console.log('User Data for custom slot:', userData); // Debug log

      // Check for either id or _id
      const userId = userData?.id || userData?._id;
      if (!userId) {
        console.error('User data missing for custom slot:', userData); // Debug log
        throw new Error('User data not found. Please sign in again.');
      }

      // Validate time slot data before sending
      if (!customTimeSlot.startTime || !customTimeSlot.endTime) {
        throw new Error('Start time and end time are required');
      }

      const timeSlotData = {
        restaurantId: userId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: {
          ...customTimeSlot,
          maxCapacity: parseInt(customTimeSlot.maxCapacity) || 1,
          price: parseFloat(customTimeSlot.price) || 0
        }
      };

      console.log('Sending time slot data:', timeSlotData); // Debug log

      const response = await fetch(`${baseURL}/availability/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeSlotData)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add custom time slot');
      }

      setShowCustomTimeSlotModal(false);
      setCustomTimeSlot({
        startTime: '',
        endTime: '',
        isAvailable: true,
        maxCapacity: 1,
        price: 0,
        description: ''
      });
      fetchAvailability();
    } catch (err) {
      console.error('Add custom time slot error:', err); // Debug log
      setError(err.message);
    }
  };

  const handleEditTimeSlot = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData._id) {
        throw new Error('User data not found');
      }

      const response = await fetch(`${baseURL}/availability/${selectedTimeSlot._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeSlot: selectedTimeSlot
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.message || 'Failed to update time slot');
      }

      setShowEditTimeSlotModal(false);
      setSelectedTimeSlot(null);
      fetchAvailability();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${baseURL}/availability/${timeSlotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.message || 'Failed to delete time slot');
      }

      fetchAvailability();
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
      <div className="flex min-h-screen bg-[#fdfcdcff] relative">
        <div className="fixed left-0 top-0 h-full z-30">
          <PartnerSideBar />
        </div>
        <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#fdfcdcff] relative">
        <div className="fixed left-0 top-0 h-full z-30">
          <PartnerSideBar />
        </div>
        <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center">{error}</p>
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
        <h1 className="text-3xl font-bold mb-8">
          Manage <span className="text-[#fea116ff]">Reservations</span>
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'reservations'
                ? 'border-b-2 border-[#fea116ff] text-[#fea116ff]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'availability'
                ? 'border-b-2 border-[#fea116ff] text-[#fea116ff]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('availability')}
          >
            Availability
          </button>
        </div>

        {activeTab === 'reservations' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Availability Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAvailabilityModal(true)}
                    className="bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#fea116cc] transition-colors flex items-center gap-2"
                  >
                    <FaCalendarPlus /> Add Time Slot
                  </button>
                  <button
                    onClick={() => setShowCustomTimeSlotModal(true)}
                    className="bg-[#fea116ff] text-white px-4 py-2 rounded-lg hover:bg-[#fea116cc] transition-colors flex items-center gap-2"
                  >
                    <FaCalendarPlus /> Add Custom Time Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Availability Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availability.map((slot, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                    slot.isAvailable ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FaClock className={`text-${slot.isAvailable ? 'green' : 'red'}-500`} />
                      <span className="font-semibold text-lg">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          setShowEditTimeSlotModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-[#fea116ff] transition-colors"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTimeSlot(slot._id)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Capacity: {slot.maxCapacity}</p>
                    <p className="text-sm text-gray-600">Price: ${slot.price}</p>
                    {slot.description && (
                      <p className="text-sm text-gray-600">Description: {slot.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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

        {/* Add Availability Modal */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Time Slot</h2>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={newAvailability.isAvailable}
                    onChange={(e) => setNewAvailability({ ...newAvailability, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-[#fea116ff] focus:ring-[#fea116ff] border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddAvailability}
                  className="flex-1 bg-[#fea116ff] text-white py-3 rounded-md hover:bg-[#fea116cc] transition-colors flex items-center justify-center"
                >
                  Add Time Slot
                </button>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Time Slot Modal */}
        {showCustomTimeSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Custom Time Slot</h2>
                <button
                  onClick={() => setShowCustomTimeSlotModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={customTimeSlot.startTime}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={customTimeSlot.endTime}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={customTimeSlot.maxCapacity}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customTimeSlot.price}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={customTimeSlot.description}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                    rows="3"
                    placeholder="Add any special details about this time slot..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={customTimeSlot.isAvailable}
                    onChange={(e) => setCustomTimeSlot({ ...customTimeSlot, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-[#fea116ff] focus:ring-[#fea116ff] border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddCustomTimeSlot}
                  className="flex-1 bg-[#fea116ff] text-white py-3 rounded-md hover:bg-[#fea116cc] transition-colors flex items-center justify-center"
                >
                  Add Custom Time Slot
                </button>
                <button
                  onClick={() => setShowCustomTimeSlotModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Time Slot Modal */}
        {showEditTimeSlotModal && selectedTimeSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Time Slot</h2>
                <button
                  onClick={() => setShowEditTimeSlotModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={selectedTimeSlot.startTime}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={selectedTimeSlot.endTime}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedTimeSlot.maxCapacity}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedTimeSlot.price}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedTimeSlot.description}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
                    rows="3"
                    placeholder="Add any special details about this time slot..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={selectedTimeSlot.isAvailable}
                    onChange={(e) => setSelectedTimeSlot({ ...selectedTimeSlot, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-[#fea116ff] focus:ring-[#fea116ff] border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleEditTimeSlot}
                  className="flex-1 bg-[#fea116ff] text-white py-3 rounded-md hover:bg-[#fea116cc] transition-colors flex items-center justify-center"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditTimeSlotModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations; 