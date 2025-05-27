import React, { useState, useEffect } from 'react';
import AdminSideBar from '../../components/AdminSideBar';
import { FaCheck, FaTimes, FaStar, FaTrash } from 'react-icons/fa';
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

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await axios.delete(`${baseURL}/feedback/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success('Feedback deleted successfully');
                fetchFeedbacks(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to delete feedback');
            
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        }
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (filter === 'all') return true;
        return feedback.status === filter;
    });

    if (loading) {
        return (
            <div className="flex bg-[#fdfcdcff] min-h-screen">
                <AdminSideBar />
                <div className="flex-1 p-8">
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#fdfcdcff] min-h-screen">
            <AdminSideBar />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#001524ff]">Feedback Management</h1>
                            <p className="text-gray-600 mt-2">View and manage all customer feedback</p>
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        >
                            <option value="all">All Feedbacks</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                                {filteredFeedbacks.map((feedback) => (
                                    <li key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <h3 className="text-lg font-medium text-[#001524ff]">{feedback.name}</h3>
                                                    <span className={`ml-2 px-3 py-1 text-sm rounded-full ${
                                                        feedback.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        feedback.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">{feedback.email}</p>
                                                <div className="mt-2 flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={`text-lg ${
                                                                star <= feedback.rating
                                                                    ? 'text-[#fea116ff]'
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
                                            <div className="ml-4 flex space-x-2">
                                                {feedback.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(feedback._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0098c9ff] hover:bg-[#0088b9ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098c9ff] transition-colors duration-200"
                                                        >
                                                            <FaCheck className="mr-2" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(feedback._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                                        >
                                                            <FaTimes className="mr-2" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(feedback._id)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                                                >
                                                    <FaTrash className="mr-2" />
                                                    Delete
                                                </button>
                                            </div>
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