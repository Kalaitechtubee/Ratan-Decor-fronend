const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Save or update userType
router.post('/set-type', async (req, res) => {
  const { userId, userType } = req.body;
  if (!userId || !userType) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.userType = userType;
    await user.save();
    res.json({ message: 'User type saved', userType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get userType by userId
router.get('/get-type/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ userType: user.userType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's type (requires authentication)
router.get('/my-type', async (req, res) => {
  try {
    // Get userId from token or session
    const userId = req.user?.id || req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ userType: user.userType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current user's type (requires authentication)
router.put('/update-type', async (req, res) => {
  try {
    const { userType } = req.body;
    const userId = req.user?.id || req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!userType) {
      return res.status(400).json({ message: 'User type is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.userType = userType;
    await user.save();
    
    res.json({ message: 'User type updated', userType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
