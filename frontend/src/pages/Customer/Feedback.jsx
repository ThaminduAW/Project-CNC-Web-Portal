import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Feedback = () => {
    const [feedback, setFeedback] = useState({
        name: '',
        email: '',
        rating: 5,
        message: '',
        category: 'general'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await axios.post('/api/feedback', feedback);
            
            if (response.data.success) {
                toast.success('Thank you for your feedback!');
                setFeedback({
                    name: '',
                    email: '',
                    rating: 5,
                    message: '',
                    category: 'general'
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Feedback</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={feedback.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={feedback.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                name="category"
                                id="category"
                                value={feedback.category}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="general">General Feedback</option>
                                <option value="service">Service</option>
                                <option value="product">Product</option>
                                <option value="experience">Experience</option>
                                <option value="suggestion">Suggestion</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                                Rating
                            </label>
                            <select
                                name="rating"
                                id="rating"
                                value={feedback.rating}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>
                                        {num} {num === 1 ? 'Star' : 'Stars'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Your Feedback
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                rows={4}
                                required
                                value={feedback.message}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Please share your thoughts..."
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback; 