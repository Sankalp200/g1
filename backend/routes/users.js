const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authorize('admin', 'moderator'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by role if specified
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by active status if specified
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Own Profile
router.get('/:id', ownerOrAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
router.post('/', authorize('admin'), [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
router.put('/:id', ownerOrAdmin, [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Role must be user, admin, or moderator'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can change role and isActive status
    if ((role !== undefined || isActive !== undefined) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Only admins can change user role or active status' 
      });
    }

    // Prevent users from deactivating themselves
    if (isActive === false && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        message: 'You cannot deactivate your own account' 
      });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admins from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        message: 'You cannot delete your own account' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/admin/stats', authorize('admin'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;