import User from '../models/User.js';

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