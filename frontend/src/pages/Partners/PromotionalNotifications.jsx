import React, { useState, useEffect } from 'react';
import PartnerSideBar from "../../components/PartnerSideBar";
import { FaEnvelope, FaUsers, FaPaperPlane, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { baseURL } from '../../utils/baseURL';
const API_URL = import.meta.env.VITE_API_URL || `${baseURL}`;

const PromotionalNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [notification, setNotification] = useState({
    subject: "",
    message: "",
    selectedCustomers: []
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const getPartnerId = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData?.id;
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');

      if (!partnerId || !token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get(`${API_URL}/partners/${partnerId}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCustomers(response.data);
    } catch (error) {
      setError('Failed to fetch customer data. Please try again later.');
      console.error('Customer data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (customerEmail) => {
    setNotification(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.includes(customerEmail)
        ? prev.selectedCustomers.filter(email => email !== customerEmail)
        : [...prev.selectedCustomers, customerEmail]
    }));
  };

  const handleSelectAll = () => {
    setNotification(prev => ({
      ...prev,
      selectedCustomers: prev.selectedCustomers.length === customers.length
        ? []
        : customers.map(customer => customer.email)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const partnerId = getPartnerId();
      const token = localStorage.getItem('token');

      if (!partnerId || !token) {
        setError('Authentication required. Please login again.');
        return;
      }

      await axios.post(
        `${API_URL}/partners/${partnerId}/notifications`,
        {
          ...notification,
          partnerId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(true);
      setNotification({
        subject: "",
        message: "",
        selectedCustomers: []
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to send notifications. Please try again later.');
      console.error('Notification send error:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcdcff]">
        <PartnerSideBar />
        <main className="ml-64 min-h-screen">
          <div className="p-8">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fea116ff]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fdfcdcff] relative">
      <div className="fixed left-0 top-0 h-full z-30">
        <PartnerSideBar />
      </div>
      <div className="flex-1 ml-[240px] p-6 md:p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            <span className="text-[#fea116ff]">Promotional Notifications</span>
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-600">Notifications sent successfully!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Notification Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg self-start">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <FaPaperPlane className="text-2xl text-[#fea116ff] mr-2" />
                Create New Notification
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={notification.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#fea116ff] focus:border-[#fea116ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={notification.message}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#fea116ff] focus:border-[#fea116ff]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || notification.selectedCustomers.length === 0}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    sending || notification.selectedCustomers.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#fea116ff] hover:bg-[#e68a00]'
                  }`}
                >
                  {sending ? 'Sending...' : 'Send Notifications'}
                </button>
              </form>
            </div>

            {/* Customer List */}
            <div className="bg-white p-6 rounded-lg shadow-lg self-start">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <FaUsers className="text-2xl text-[#fea116ff] mr-2" />
                  Previous Customers
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-[#fea116ff] hover:text-[#e68a00]"
                >
                  {notification.selectedCustomers.length === customers.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {customers.map((customer) => (
                  <div
                    key={customer.email}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notification.selectedCustomers.includes(customer.email)}
                      onChange={() => handleCustomerSelect(customer.email)}
                      className="h-5 w-5 text-[#fea116ff] focus:ring-[#fea116ff] border-gray-300 rounded"
                    />
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No previous customers found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalNotifications; 