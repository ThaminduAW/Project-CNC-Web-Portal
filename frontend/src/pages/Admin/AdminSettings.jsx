import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Divider,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminSideBar from '../../components/AdminSideBar';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    userManagement: {
      allowUserRegistration: true,
      requireEmailVerification: true,
      maxLoginAttempts: 5,
    },
    systemSettings: {
      maintenanceMode: false,
      enableBackup: true,
      backupFrequency: 'daily',
    },
    securitySettings: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      userActivityLogs: true,
    },
  });

  const [admin, setAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch admin details from localStorage or API
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setAdmin(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      }));
    }
  }, []);

  const handleSettingChange = (category, setting) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartEditing = () => {
    if (!admin.currentPassword) {
      setError('Please enter your current password to edit profile');
      return;
    }
    // TODO: Verify current password with backend
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validate passwords
    if (admin.newPassword !== admin.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // TODO: Implement save functionality with backend
    console.log('Saving admin details:', admin);
    setSuccess('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="flex">
      <AdminSideBar />
      <div className="flex-1 p-8">
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Admin Profile Settings
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={admin.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={admin.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={admin.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={admin.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>

              {!isEditing ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={admin.currentPassword}
                    onChange={handleInputChange}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={admin.newPassword}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={admin.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleStartEditing}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default AdminSettings;