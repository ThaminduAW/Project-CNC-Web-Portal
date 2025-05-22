import React, { useState, useEffect } from 'react';
import AdminSideBar from '../../components/AdminSideBar';
import { FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from '../../utils/baseURL';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.get(`${baseURL}/feedback`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setFeedbacks(response.data.data);
            } else {
                setError('Failed to fetch feedbacks');
                toast.error('Failed to fetch feedbacks');
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setError('Failed to fetch feedbacks');
            toast.error(error.response?.data?.message || 'Failed to fetch feedbacks');
            
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.put(`${baseURL}/feedback/${id}/approve`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success('Feedback approved successfully');
                fetchFeedbacks(); // Refresh the list
            }
        } catch (error) {
            console.error('Error approving feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to approve feedback');
            
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.put(`${baseURL}/feedback/${id}/reject`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success('Feedback rejected successfully');
                fetchFeedbacks(); // Refresh the list
            }
        } catch (error) {
            console.error('Error rejecting feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to reject feedback');
            
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        }
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (filter === 'all') return true;
        return feedback.status === filter;
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSideBar />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">All Feedbacks</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {filteredFeedbacks.map((feedback) => (
                                    <li key={feedback._id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <h3 className="text-lg font-medium text-gray-900">{feedback.name}</h3>
                                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                        feedback.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        feedback.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {feedback.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{feedback.email}</p>
                                                <div className="mt-2 flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`text-lg ${
                                                                star <= feedback.rating
                                                                    ? 'text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-gray-600">{feedback.message}</p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Category: {feedback.category}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {feedback.status === 'pending' && (
                                                <div className="ml-4 flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(feedback._id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        <FaCheck className="mr-2" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(feedback._id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <FaTimes className="mr-2" />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackManagement; 