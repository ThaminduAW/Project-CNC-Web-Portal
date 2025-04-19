import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TourDetail = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/tours/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tour');
        }
        const data = await response.json();
        setTour(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tour) {
    return <div>Tour not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={tour.image}
              alt={tour.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="text-gray-600 mb-4">{tour.description}</p>
            <div className="mb-4">
              <span className="font-semibold">Price:</span> ${tour.price}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Date:</span> {new Date(tour.date).toLocaleDateString()}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Location:</span> {tour.location}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Partner:</span> {tour.partner?.restaurantName || 'Unknown Partner'}
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail; 