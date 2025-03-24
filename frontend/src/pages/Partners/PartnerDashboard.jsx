import React, { useState, useEffect } from 'react';
import PartnerSideBar from "../../components/PartnerSideBar";
import { Card, Row, Col, Typography, List, Avatar, Divider, Spin, message } from 'antd';
import 'antd/dist/reset.css';
import axios from 'axios';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ShopOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PartnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    totalEvents: 0,
    totalCustomers: 0,
    profile: {
      name: "",
      address: "",
      phone: "",
      email: "",
      cuisine: "",
      rating: 0
    },
    recentActivities: []
  });

  // Get partner ID from localStorage or context
  const getPartnerId = () => {
    // Replace this with your actual auth context or storage method
    const partnerData = JSON.parse(localStorage.getItem('partnerData'));
    return partnerData?.id;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const partnerId = getPartnerId();
      
      if (!partnerId) {
        message.error('Partner ID not found. Please login again.');
        return;
      }

      // Fetch all data in a single API call
      const response = await axios.get(`${API_URL}/partners/${partnerId}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      message.error('Failed to fetch dashboard data. Please try again later.');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex">
      <PartnerSideBar />
      <div className="flex-1 p-6">
        <Title level={2}>Dashboard</Title>
        
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <CalendarOutlined className="text-2xl text-blue-500 mr-4" />
                <div>
                  <Text className="text-gray-500">Total Reservations</Text>
                  <div className="text-2xl font-bold">{dashboardData.totalReservations}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <ClockCircleOutlined className="text-2xl text-orange-500 mr-4" />
                <div>
                  <Text className="text-gray-500">Pending Reservations</Text>
                  <div className="text-2xl font-bold">{dashboardData.pendingReservations}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <ShopOutlined className="text-2xl text-green-500 mr-4" />
                <div>
                  <Text className="text-gray-500">Total Events</Text>
                  <div className="text-2xl font-bold">{dashboardData.totalEvents}</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <div className="flex items-center">
                <UserOutlined className="text-2xl text-purple-500 mr-4" />
                <div>
                  <Text className="text-gray-500">Total Customers</Text>
                  <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Restaurant Profile */}
        <Card title="Restaurant Profile" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text strong>Name:</Text> {dashboardData.profile.name}
            </div>
            <div>
              <Text strong>Address:</Text> {dashboardData.profile.address}
            </div>
            <div>
              <Text strong>Phone:</Text> {dashboardData.profile.phone}
            </div>
            <div>
              <Text strong>Email:</Text> {dashboardData.profile.email}
            </div>
            <div>
              <Text strong>Cuisine:</Text> {dashboardData.profile.cuisine}
            </div>
            <div>
              <Text strong>Rating:</Text> {dashboardData.profile.rating} / 5
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activities">
          <List
            itemLayout="horizontal"
            dataSource={dashboardData.recentActivities}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={
                      item.type === "reservation" ? <CalendarOutlined /> :
                      item.type === "event" ? <ShopOutlined /> :
                      <UserOutlined />
                    } />
                  }
                  title={item.description}
                  description={item.time}
                />
                <div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;