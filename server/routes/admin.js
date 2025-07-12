const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(adminOnly);

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalItems = await Item.countDocuments();
    const totalSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const pendingApprovals = await Item.countDocuments({ isApproved: false });

    // Get user registrations over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get items by category
    const itemsByCategory = await Item.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get swap statistics
    const swapStats = await SwapRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total points in circulation
    const totalPointsResult = await User.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    const totalPointsInCirculation = totalPointsResult[0]?.totalPoints || 0;

    // Get recent activity
    const recentSwaps = await SwapRequest.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('requesterId', 'name')
      .populate('itemOwnerId', 'name')
      .populate('itemId', 'title');

    const recentItems = await Item.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploaderId', 'name');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalItems,
          totalSwaps,
          pendingApprovals,
          totalPointsInCirculation,
          recentUsers
        },
        itemsByCategory,
        swapStats,
        recentActivity: {
          recentSwaps,
          recentItems
        }
      },
      message: 'Admin statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get pending items for approval
// @route   GET /api/admin/items/pending
// @access  Private (Admin)
router.get('/items/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const pendingItems = await Item.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploaderId', 'name email avatar location');

    const total = await Item.countDocuments({ isApproved: false });

    res.json({
      success: true,
      data: {
        items: pendingItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'Pending items retrieved successfully'
    });
  } catch (error) {
    console.error('Get pending items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve an item
// @route   PUT /api/admin/items/:id/approve
// @access  Private (Admin)
router.put('/items/:id/approve', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.isApproved = true;
    item.adminNotes = req.body.adminNotes || '';
    await item.save();

    // Award points to the user for approved item
    const user = await User.findById(item.uploaderId);
    if (user) {
      await user.addPoints(item.pointsValue);
    }

    res.json({
      success: true,
      data: item,
      message: 'Item approved successfully'
    });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Reject an item
// @route   PUT /api/admin/items/:id/reject
// @access  Private (Admin)
router.put('/items/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.status = 'removed';
    item.rejectionReason = rejectionReason;
    item.adminNotes = req.body.adminNotes || '';
    await item.save();

    res.json({
      success: true,
      data: item,
      message: 'Item rejected successfully'
    });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.isActive = req.query.status === 'active';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating admin users
    if (user.isAdmin && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's items
    const items = await Item.find({ uploaderId: req.params.id }).sort({ createdAt: -1 });

    // Get user's swap history
    const swapHistory = await SwapRequest.find({
      $or: [
        { requesterId: req.params.id },
        { itemOwnerId: req.params.id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title images')
      .populate('offeredItemId', 'title images');

    res.json({
      success: true,
      data: {
        user,
        items,
        swapHistory,
        stats: {
          totalItems: items.length,
          totalSwaps: swapHistory.filter(swap => swap.status === 'completed').length,
          pendingSwaps: swapHistory.filter(swap => swap.status === 'pending').length
        }
      },
      message: 'User details retrieved successfully'
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete an item (Admin only)
// @route   DELETE /api/admin/items/:id
// @access  Private (Admin)
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Delete associated images
    const fs = require('fs');
    const path = require('path');
    item.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration analytics
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Item listings analytics
    const itemListings = await Item.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Swap completions analytics
    const swapCompletions = await SwapRequest.aggregate([
      { 
        $match: { 
          completedAt: { $gte: startDate },
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Category distribution
    const categoryDistribution = await Item.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Points distribution
    const pointsDistribution = await User.aggregate([
      {
        $bucket: {
          groupBy: '$points',
          boundaries: [0, 50, 100, 200, 500, 1000, 10000],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userRegistrations,
        itemListings,
        swapCompletions,
        categoryDistribution,
        pointsDistribution
      },
      message: 'Analytics data retrieved successfully'
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;