import React, { useState, useEffect } from 'react';
import AdminSideBar from '../../components/AdminSideBar';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/api/requests', {
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/requests/${requestId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      // Refresh requests after action
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderChanges = (changes, originalData) => {
    const changedFields = [];
    Object.keys(changes).forEach(key => {
      if (key !== 'operatingHours' && changes[key] !== originalData[key]) {
        changedFields.push(
          <div key={key} className="mb-2">
            <span className="font-semibold">{key}: </span>
            <span className="text-red-500">{originalData[key]}</span>
            <span className="mx-2">→</span>
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
            <span className="font-semibold">Operating Hours Updated</span>
          </div>
        );
      }
    }

    return changedFields;
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSideBar />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <AdminSideBar />
        <div className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Partner Change Requests</h1>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {request.partnerId?.restaurantName || 'Unknown Restaurant'}
                      </h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Submitted by: {request.partnerId?.fullName}</p>
                      <p>Email: {request.partnerId?.email}</p>
                      <p>Date: {new Date(request.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Requested Changes:</h4>
                      {renderChanges(request.changes, request.originalData)}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="ml-4 space-y-2">
                      <button
                        onClick={() => handleRequestAction(request._id, 'approve')}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
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