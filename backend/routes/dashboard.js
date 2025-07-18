const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    // Basic statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Mock data for projects and tasks (you can replace with real data later)
    const activeProjects = 12;
    const completedTasks = 45;
    const pendingTasks = 18;

    res.json({
      totalUsers,
      activeUsers,
      activeProjects,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
router.get('/activity', async (req, res, next) => {
  try {
    // Mock activity data - replace with real activity tracking later
    const recentActivity = [
      {
        icon: '👤',
        text: 'New user John Doe registered',
        time: '2 hours ago'
      },
      {
        icon: '📋',
        text: 'Project "Mobile App" was created',
        time: '4 hours ago'
      },
      {
        icon: '✅',
        text: 'Task "Design Homepage" completed',
        time: '6 hours ago'
      },
      {
        icon: '🚀',
        text: 'Project "API Development" launched',
        time: '1 day ago'
      },
      {
        icon: '👥',
        text: 'Team meeting scheduled for tomorrow',
        time: '2 days ago'
      }
    ];

    res.json(recentActivity);
  } catch (error) {
    next(error);
  }
});

// @desc    Get user analytics
// @route   GET /api/dashboard/analytics
// @access  Private
router.get('/analytics', async (req, res, next) => {
  try {
    // User registration trends (last 7 days)
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await User.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      last7Days.push({
        date: startOfDay.toISOString().split('T')[0],
        users: count
      });
    }

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Active vs Inactive users
    const activeCount = await User.countDocuments({ isActive: true });
    const inactiveCount = await User.countDocuments({ isActive: false });

    res.json({
      userRegistrationTrend: last7Days,
      usersByRole: usersByRole.map(item => ({
        role: item._id,
        count: item.count
      })),
      activeVsInactive: {
        active: activeCount,
        inactive: inactiveCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system health
// @route   GET /api/dashboard/health
// @access  Private
router.get('/health', async (req, res, next) => {
  try {
    const dbConnected = require('mongoose').connection.readyState === 1;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: {
        seconds: Math.floor(uptime),
        human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;