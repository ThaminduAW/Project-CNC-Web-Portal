import React, { useState, useEffect } from 'react';
import AdminSideBar from '../../components/AdminSideBar';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchRequests();
  }, []);

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
      const updatedResponse = await fetch('http://localhost:3000/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await updatedResponse.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
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
        <h1 className="text-2xl font-bold mb-6">Requests</h1>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Status: <span className={`font-semibold ${
                        request.status === 'pending' ? 'text-yellow-600' :
                        request.status === 'approved' ? 'text-green-600' :
                        'text-red-600'
                      }`}>{request.status}</span></p>
                      <p>Submitted by: {request.submittedBy}</p>
                      <p>Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRequestAction(request._id, 'approve')}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
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