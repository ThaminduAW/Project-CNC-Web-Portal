import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new request (Partner only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Only partners can create requests' });
    }

    console.log('Request body:', req.body);
    console.log('User data:', req.user);

    const { type, changes, originalData, submittedBy } = req.body;

    // Validate required fields
    if (!type || !changes || !originalData || !submittedBy) {
      console.log('Missing required fields:', {
        hasType: !!type,
        hasChanges: !!changes,
        hasOriginalData: !!originalData,
        hasSubmittedBy: !!submittedBy
      });
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          type: !!type,
          changes: !!changes,
          hasOriginalData: !!originalData,
          hasSubmittedBy: !!submittedBy
        }
      });
    }

    // Get user ID from authenticated user
    const userId = req.user._id || req.user.id;
    if (!userId) {
      console.error('Invalid user data in request:', req.user);
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Create request document with explicit partnerId
    const requestData = {
      partnerId: userId, // Use the extracted userId
      type,
      changes,
      originalData,
      submittedBy
    };

    console.log('Creating new request with data:', requestData);

    const newRequest = new Request(requestData);

    console.log('New request object:', newRequest);

    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
});

// Get all requests (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await Request.find()
      .populate('partnerId', 'fullName restaurantName email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get partner's own requests
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await Request.find({ partnerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle request action (approve/reject)
router.put('/:requestId/:action', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { requestId, action } = req.params;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    if (action === 'approve') {
      // Update user data with requested changes
      await User.findByIdAndUpdate(request.partnerId, request.changes);
      request.status = 'approved';
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await request.save();
    res.json({ message: `Request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 