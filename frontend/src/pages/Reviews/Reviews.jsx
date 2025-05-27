import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaStar, FaFilter } from 'react-icons/fa';
import { baseURL } from '../../utils/baseURL';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${baseURL}/feedback/approved`);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.rating === parseInt(filter);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${i < rating ? 'text-[#fea116ff]' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#fdfcdcff]">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl pt-30">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            What Our <span className="text-[#fea116ff]">Customers Say</span>
          </h1>
          <p className="text-center text-gray-600 text-lg mt-3">
            Read what our customers have to say about their experiences
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFilter className="text-[#fea116ff]" />
              <span className="text-[#001524ff] font-medium">Filter by Rating:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', '5', '4', '3', '2', '1'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilter(rating)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    filter === rating
                      ? 'bg-[#fea116ff] text-white'
                      : 'bg-gray-100 text-[#001524ff] hover:bg-gray-200'
                  }`}
                >
                  {rating === 'all' ? 'All' : `${rating} Stars`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#001524ff] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 text-[#001524ff] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fea116ff]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fea116ff]"></div>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-xl">No reviews found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#fea116ff]/10 flex items-center justify-center">
                    <span className="text-[#fea116ff] text-xl font-bold">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#001524ff]">{review.name}</h3>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{review.message}"</p>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-white rounded-xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fea116ff] mb-2">
                {reviews.length}
              </div>
              <div className="text-[#001524ff]">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fea116ff] mb-2">
                {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-[#001524ff]">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#fea116ff] mb-2">
                {reviews.filter(review => review.rating === 5).length}
              </div>
              <div className="text-[#001524ff]">5-Star Reviews</div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews; 