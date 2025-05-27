import React, { useState, useEffect } from 'react';
import AdminSideBar from '../../components/AdminSideBar';
import { FaClock, FaUser, FaEnvelope, FaCheck, FaTimes, FaTrash, FaFilter } from 'react-icons/fa';
import { baseURL } from '../../utils/baseURL';
import { toast } from 'react-toastify';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/requests/${requestId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      toast.success(`Request ${action}d successfully!`);
      // Refresh requests after action
      fetchRequests();
    } catch (err) {
      toast.error(err.message || `Failed to ${action} request`);
    }
  };

  const handleDeleteRequest = async (requestId, restaurantName) => {
    if (!window.confirm(`Are you sure you want to delete the request for ${restaurantName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      toast.success('Request deleted successfully!');
      // Refresh requests after deletion
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to delete request');
    }
  };

  const handleBulkDeleteProcessed = async () => {
    const processedRequests = requests.filter(req => req.status !== 'pending');
    
    if (processedRequests.length === 0) {
      toast.info('No processed requests to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete all ${processedRequests.length} processed (approved/rejected) requests? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/requests/bulk/processed`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete processed requests');
      }

      const data = await response.json();
      toast.success(data.message);
      // Refresh requests after deletion
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to delete processed requests');
    }
  };

  const renderChanges = (changes, originalData) => {
    const changedFields = [];
    Object.keys(changes).forEach(key => {
      if (key !== 'operatingHours' && changes[key] !== originalData[key]) {
        changedFields.push(
          <div key={key} className="mb-2">
            <span className="font-semibold text-[#001524ff]">{key}: </span>
            <span className="text-red-500">{originalData[key]}</span>
            <span className="mx-2 text-[#fea116ff]">→</span>
            <span className="text-green-500">{changes[key]}</span>
          </div>
        );
      }
    });

    // Handle operating hours changes separately
    if (changes.operatingHours) {
      const hoursChanged = JSON.stringify(changes.operatingHours) !== JSON.stringify(originalData.operatingHours);
      if (hoursChanged) {
        changedFields.push(
          <div key="operatingHours" className="mb-2">
            <span className="font-semibold text-[#001524ff]">Operating Hours Updated</span>
          </div>
        );
      }
    }

    return changedFields;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#fdfcdcff]">
        <AdminSideBar />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#0098c9ff] bg-opacity-20 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-[#0098c9ff] bg-opacity-20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter requests based on selected filter
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff]">
      <AdminSideBar />
      <div className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#001524ff]">Partner Change Requests</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Bulk Delete Button */}
            {requests.filter(req => req.status !== 'pending').length > 0 && (
              <button
                onClick={handleBulkDeleteProcessed}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                title="Delete all processed requests"
              >
                <FaTrash className="mr-2" />
                Clear Processed ({requests.filter(req => req.status !== 'pending').length})
              </button>
            )}
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-[#fea116ff]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-[#001524ff]">{requests.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        )}
        
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? 'No requests found' : `No ${filter} requests found`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <h3 className="text-xl font-semibold text-[#001524ff]">
                        {request.partnerId?.restaurantName || 'Unknown Restaurant'}
                      </h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaUser className="mr-2 text-[#fea116ff]" />
                        <span>{request.partnerId?.fullName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="mr-2 text-[#fea116ff]" />
                        <span>{request.partnerId?.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-[#fea116ff]" />
                        <span>{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-[#001524ff] mb-3">Requested Changes:</h4>
                      {renderChanges(request.changes, request.originalData)}
                    </div>
                  </div>

                  <div className="ml-4 space-y-2 min-w-[120px]">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRequestAction(request._id, 'approve')}
                          className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        >
                          <FaCheck className="mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, 'reject')}
                          className="w-full flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                          <FaTimes className="mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {/* Delete button - available for all requests */}
                    <button
                      onClick={() => handleDeleteRequest(request._id, request.partnerId?.restaurantName || 'Unknown Restaurant')}
                      className="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                      title="Delete this request"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests; 