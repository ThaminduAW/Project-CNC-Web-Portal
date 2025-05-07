import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/emailUtils.js';

// Get partner profile
export const getPartnerProfile = async (req, res) => {
  try {
    const partner = await User.findById(req.user._id);
    if (!partner || partner.role !== 'Partner') {
      return res.status(404).json({ message: 'Partner profile not found' });
    }
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update partner profile
export const updatePartnerProfile = async (req, res) => {
  try {
    const partner = await User.findById(req.user._id);
    if (!partner || partner.role !== 'Partner') {
      return res.status(404).json({ message: 'Partner profile not found' });
    }

    // Update partner fields
    const updates = Object.keys(req.body);
    updates.forEach(update => {
      partner[update] = req.body[update];
    });

    await partner.save();
    res.json(partner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update partner images
export const updatePartnerImages = async (req, res) => {
  try {
    const partner = await User.findById(req.user._id);
    if (!partner || partner.role !== 'Partner') {
      return res.status(404).json({ message: 'Partner profile not found' });
    }

    if (req.files) {
      if (req.files.logo) {
        partner.logo = req.files.logo[0].path;
      }
      if (req.files.images) {
        partner.images = req.files.images.map(file => file.path);
      }
    }

    await partner.save();
    res.json(partner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get previous customers for a partner
export const getPreviousCustomers = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;

    // Find all reservations for this partner (restaurant)
    const reservations = await Reservation.find({ restaurant: partnerId }).lean();

    // Extract unique customers by email
    const uniqueCustomers = {};
    reservations.forEach(reservation => {
      if (reservation.email) {
        uniqueCustomers[reservation.email] = {
          name: reservation.name,
          email: reservation.email
        };
      }
    });

    res.status(200).json(Object.values(uniqueCustomers));
  } catch (error) {
    console.error('Error fetching previous customers:', error);
    res.status(500).json({ message: 'Failed to fetch previous customers' });
  }
};

// Send promotional notifications
export const sendPromotionalNotifications = async (req, res) => {
  try {
    const { subject, message, selectedCustomers } = req.body;
    const partnerId = req.params.partnerId;

    // Get partner details
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== 'Partner') {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Use emails directly
    const customers = selectedCustomers.map(email => ({
      email,
      name: email 
    }));

    // Send emails to selected customers
    for (const customer of customers) {
      await sendEmail({
        to: customer.email,
        subject: subject,
        text: `Dear ${customer.name},\n\n${message}\n\nBest regards,\n${partner.restaurantName}`
      });
    }

    // Save notification record (store emails)
    const notification = new Notification({
      partnerId,
      subject,
      message,
      recipients: selectedCustomers,
      sentAt: new Date()
    });
    await notification.save();

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending promotional notifications:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
}; 
