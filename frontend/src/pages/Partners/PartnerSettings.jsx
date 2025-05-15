import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import PartnerSideBar from '../../components/PartnerSideBar';
import { FaClock, FaMapMarkerAlt, FaGlobe, FaUtensils, FaUser, FaPhone, FaEnvelope, FaLock, FaCalendarAlt, FaExclamationCircle, FaKey, FaSave, FaPlus, FaTrash, FaInfoCircle, FaList, FaCamera } from 'react-icons/fa';
import { baseURL } from '../../utils/baseURL';

const PartnerSettings = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    restaurantName: '',
    address: '',
    phone: '',
    email: '',
    url: '',
    cuisine: '',
    about: '',
    features: [],
    restaurantPhoto: '',
    operatingHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [pendingChanges, setPendingChanges] = useState(false);
  const [formData, setFormData] = useState(null);

  const [newFeature, setNewFeature] = useState({ name: '', description: '', icon: '⭐' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      const response = await axios.get(`${baseURL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.user) {
        // Convert time strings to Date objects for TimePicker
        const formatOperatingHours = (hours) => {
          const formattedHours = {};
          Object.keys(hours).forEach(day => {
            formattedHours[day] = {
              open: hours[day].open ? new Date(`1970-01-01T${hours[day].open}`) : null,
              close: hours[day].close ? new Date(`1970-01-01T${hours[day].close}`) : null
            };
          });
          return formattedHours;
        };

        const formattedData = {
          fullName: response.data.user.fullName || '',
          restaurantName: response.data.user.restaurantName || '',
          address: response.data.user.address || '',
          phone: response.data.user.phone || '',
          email: response.data.user.email || '',
          url: response.data.user.url || '',
          cuisine: response.data.user.cuisine || '',
          about: response.data.user.about || '',
          features: response.data.user.features || [],
          restaurantPhoto: response.data.user.restaurantPhoto || '',
          operatingHours: response.data.user.operatingHours ? 
            formatOperatingHours(response.data.user.operatingHours) : 
            {
              monday: { open: null, close: null },
              tuesday: { open: null, close: null },
              wednesday: { open: null, close: null },
              thursday: { open: null, close: null },
              friday: { open: null, close: null },
              saturday: { open: null, close: null },
              sunday: { open: null, close: null }
            }
        };

        setUserData(formattedData);
        setFormData(formattedData); // Store initial form data
      }

      // Check for pending requests
      const pendingResponse = await axios.get(`${baseURL}/requests/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (pendingResponse.data && pendingResponse.data.some(req => req.status === 'pending')) {
        setPendingChanges(true);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to fetch profile data' });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (day, type, time) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [type]: time
        }
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      const response = await axios.put(`${baseURL}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      setMessage({ type: 'error', text: errorMessage });
      
      if (error.response?.status === 401) {
        // Handle session expiration
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      } else if (error.response?.status === 400) {
        // Handle validation errors
        setPasswordError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      // Convert Date objects back to time strings for the backend
      const formatTimeForBackend = (hours) => {
        const formattedHours = {};
        Object.keys(hours).forEach(day => {
          formattedHours[day] = {
            open: hours[day].open ? hours[day].open.toTimeString().slice(0, 5) : '',
            close: hours[day].close ? hours[day].close.toTimeString().slice(0, 5) : ''
          };
        });
        return formattedHours;
      };

      // Get current user data from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        console.error('No user data found in localStorage');
        throw new Error('No user data found. Please login again.');
      }

      // Handle both id and _id fields
      const userId = currentUser._id || currentUser.id;
      if (!userId) {
        console.error('Invalid user data:', currentUser);
        throw new Error('Invalid user data. Please login again.');
      }

      // Prepare the data to send
      const dataToSend = {
        fullName: formData.fullName,
        restaurantName: formData.restaurantName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        url: formData.url,
        about: formData.about,
        features: formData.features,
        operatingHours: formatTimeForBackend(formData.operatingHours)
      };

      const requestData = {
        type: 'PROFILE_UPDATE',
        changes: dataToSend,
        originalData: {
          ...currentUser,
          _id: userId
        },
        submittedBy: currentUser.fullName
      };

      console.log('Sending request with data:', requestData);

      // Create a change request
      const response = await axios.post(`${baseURL}/requests`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setPendingChanges(true);
        setMessage({ 
          type: 'success', 
          text: 'Profile update request submitted successfully. Waiting for admin approval.' 
        });
      }

    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit update request';
      setMessage({ type: 'error', text: errorMessage });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.name.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), { ...newFeature }]
      }));
      setNewFeature({ name: '', description: '', icon: '⭐' });
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseURL}/upload/photo`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.photoUrl) {
        // If the backend returns a relative path, build the full URL
        const photoUrl = response.data.photoUrl.startsWith('http')
          ? response.data.photoUrl
          : `${baseURL}${response.data.photoUrl}`;
        setFormData(prev => ({
          ...prev,
          restaurantPhoto: photoUrl
        }));
        setMessage({ type: 'success', text: 'Photo uploaded successfully' });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#fdfcdcff]">
      <PartnerSideBar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#001524ff]">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your restaurant profile and settings</p>
              {pendingChanges && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    You have pending changes waiting for admin approval
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  {message.type === 'success' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Restaurant Photo Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6 flex items-center">
                  <FaCamera className="mr-2 text-[#fea116ff]" />
                  Restaurant Photo
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="relative w-48 h-48">
                      {formData?.restaurantPhoto ? (
                        <img
                          src={formData.restaurantPhoto}
                          alt="Restaurant"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <FaCamera className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Restaurant Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="inline-flex items-center px-4 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200 cursor-pointer"
                      >
                        <FaCamera className="mr-2" />
                        Choose Photo
                      </label>
                      <p className="mt-2 text-sm text-gray-500">
                        Recommended size: 800x600px. Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData?.fullName || userData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData?.email || userData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200 bg-gray-100"
                      required
                      disabled
                    />
                  </div>

                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData?.phone || userData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6">Restaurant Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData?.restaurantName || userData.restaurantName}
                      onChange={handleInputChange}
                      placeholder="Restaurant Name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="relative">
                    <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="url"
                      value={formData?.url || userData.url}
                      onChange={handleInputChange}
                      placeholder="Website URL"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="relative col-span-2">
                    <FaMapMarkerAlt className="absolute left-3 top-4 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData?.address || userData.address}
                      onChange={handleInputChange}
                      placeholder="Restaurant Address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                      rows="2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6 flex items-center">
                  <FaInfoCircle className="mr-2 text-[#fea116ff]" />
                  About Your Restaurant
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Description</label>
                    <textarea
                      name="about"
                      value={formData?.about || userData.about}
                      onChange={handleInputChange}
                      placeholder="Tell us about your restaurant..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6 flex items-center">
                  <FaList className="mr-2 text-[#fea116ff]" />
                  Restaurant Features
                </h2>
                <div className="space-y-6">
                  {/* Existing Features */}
                  {formData?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h3 className="font-medium">{feature.name}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}

                  {/* Add New Feature Form */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Add New Feature</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <input
                          type="text"
                          value={newFeature.icon}
                          onChange={(e) => setNewFeature(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="e.g., ⭐"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={newFeature.name}
                          onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Feature name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={newFeature.description}
                          onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Feature description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="mt-4 px-4 py-2 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200 flex items-center"
                    >
                      <FaPlus className="mr-2" />
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6 flex items-center">
                  <FaClock className="mr-2 text-[#fea116ff]" />
                  Operating Hours
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    {Object.keys(formData?.operatingHours || {}).map((day) => (
                      <div key={day} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
                        <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200 flex items-center">
                          <FaCalendarAlt className="mr-2 text-[#fea116ff]" />
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </h3>
                        <div className="space-y-3">
                          <div className="relative">
                            <TimePicker
                              label="Opening Time"
                              value={formData?.operatingHours?.[day]?.open || null}
                              onChange={(time) => handleTimeChange(day, 'open', time)}
                              className="w-full"
                              slotProps={{ 
                                textField: { 
                                  size: 'small',
                                  className: 'bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200',
                                  InputProps: {
                                    startAdornment: (
                                      <FaClock className="mr-2 text-[#fea116ff]" />
                                    )
                                  }
                                } 
                              }}
                            />
                          </div>
                          <div className="relative">
                            <TimePicker
                              label="Closing Time"
                              value={formData?.operatingHours?.[day]?.close || null}
                              onChange={(time) => handleTimeChange(day, 'close', time)}
                              className="w-full"
                              slotProps={{ 
                                textField: { 
                                  size: 'small',
                                  className: 'bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200',
                                  InputProps: {
                                    startAdornment: (
                                      <FaClock className="mr-2 text-[#fea116ff]" />
                                    )
                                  }
                                } 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </LocalizationProvider>
                </div>
                
                {/* Save Changes Button */}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Password Change Section */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#001524ff] mb-6 flex items-center">
                  <FaLock className="mr-2 text-[#fea116ff]" />
                  Change Password
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Current Password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="New Password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm New Password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fea116ff] focus:border-transparent transition-all duration-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                      <FaExclamationCircle className="mr-2" />
                      {passwordError}
                    </div>
                  )}

                  {/* Update Password Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-[#fea116ff] text-white rounded-lg hover:bg-[#e69510ff] transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaKey className="mr-2" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerSettings;