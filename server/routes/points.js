const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's points balance
// @route   GET /api/points/balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points');
    
    res.json({
      success: true,
      data: {
        points: user.points,
        userId: user._id
      },
      message: 'Points balance retrieved successfully'
    });
  } catch (error) {
    console.error('Get points balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's transaction history
// @route   GET /api/points/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    // Get transactions from completed swaps
    const swapTransactions = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { requesterId: userId, status: 'completed' },
            { itemOwnerId: userId, status: 'completed' }
          ]
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $addFields: {
          transactionType: {
            $cond: {
              if: { $eq: ['$requesterId', userId] },
              then: 'spend',
              else: 'earn'
            }
          },
          points: {
            $cond: {
              if: { $eq: ['$type', 'point-redemption'] },
              then: '$pointsOffered',
              else: '$item.pointsValue'
            }
          },
          description: {
            $cond: {
              if: { $eq: ['$requesterId', userId] },
              then: { $concat: ['Redeemed: ', '$item.title'] },
              else: { $concat: ['Earned from: ', '$item.title'] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          type: '$transactionType',
          points: 1,
          description: 1,
          createdAt: '$completedAt',
          itemId: '$item._id',
          itemTitle: '$item.title',
          itemImage: { $arrayElemAt: ['$item.images', 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Get total count for pagination
    const totalTransactions = await SwapRequest.countDocuments({
      $or: [
        { requesterId: userId, status: 'completed' },
        { itemOwnerId: userId, status: 'completed' }
      ]
    });

    // Calculate points summary
    const pointsSummary = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { requesterId: userId, status: 'completed' },
            { itemOwnerId: userId, status: 'completed' }
          ]
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: '$item'
      },
      {
        $group: {
          _id: null,
          totalEarned: {
            $sum: {
              $cond: {
                if: { $eq: ['$itemOwnerId', userId] },
                then: {
                  $cond: {
                    if: { $eq: ['$type', 'point-redemption'] },
                    then: '$pointsOffered',
                    else: '$item.pointsValue'
                  }
                },
                else: 0
              }
            }
          },
          totalSpent: {
            $sum: {
              $cond: {
                if: { $eq: ['$requesterId', userId] },
                then: {
                  $cond: {
                    if: { $eq: ['$type', 'point-redemption'] },
                    then: '$pointsOffered',
                    else: 0
                  }
                },
                else: 0
              }
            }
          }
        }
      }
    ]);

    const summary = pointsSummary[0] || { totalEarned: 0, totalSpent: 0 };

    res.json({
      success: true,
      data: {
        transactions: swapTransactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalItems: totalTransactions,
          itemsPerPage: limit
        },
        summary: {
          currentBalance: req.user.points,
          totalEarned: summary.totalEarned,
          totalSpent: summary.totalSpent,
          netGain: summary.totalEarned - summary.totalSpent
        }
      },
      message: 'Transaction history retrieved successfully'
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Redeem points for an item
// @route   POST /api/points/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
  try {
    const { itemId, points } = req.body;

    if (!itemId || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and valid points amount are required'
      });
    }

    // Get the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is available
    if (item.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for redemption'
      });
    }

    // Check if user is trying to redeem their own item
    if (item.uploaderId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot redeem your own item'
      });
    }

    // Check if user has enough points
    if (req.user.points < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    // Check if points meet the minimum requirement
    if (points < item.pointsValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${item.pointsValue} points required for this item`
      });
    }

    // Check if there's already a pending redemption for this item from this user
    const existingRequest = await SwapRequest.findOne({
      itemId,
      requesterId: req.user._id,
      type: 'point-redemption',
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending redemption request for this item'
      });
    }

    // Create the swap request for point redemption
    const swapRequest = new SwapRequest({
      requesterId: req.user._id,
      requesterName: req.user.name,
      requesterAvatar: req.user.avatar,
      itemId,
      itemOwnerId: item.uploaderId,
      itemTitle: item.title,
      itemImages: item.images,
      pointsOffered: points,
      type: 'point-redemption'
    });

    await swapRequest.save();

    // Update the item to include this swap request
    item.swapRequests.push(swapRequest._id);
    await item.save();

    res.status(201).json({
      success: true,
      data: swapRequest,
      message: 'Point redemption request created successfully'
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get points earning opportunities
// @route   GET /api/points/opportunities
// @access  Private
router.get('/opportunities', protect, async (req, res) => {
  try {
    // Get user's items that could earn points
    const userItems = await Item.find({
      uploaderId: req.user._id,
      status: 'available',
      isApproved: true
    }).select('title images pointsValue views likes');

    // Get items the user might be interested in based on their activity
    const interestedItems = await Item.find({
      uploaderId: { $ne: req.user._id },
      status: 'available',
      isApproved: true,
      pointsValue: { $lte: req.user.points }
    })
      .sort({ likes: -1, views: -1 })
      .limit(10)
      .select('title images pointsValue category type size');

    // Calculate potential earnings
    const potentialEarnings = userItems.reduce((total, item) => total + item.pointsValue, 0);

    // Get tips for earning more points
    const tips = [
      {
        title: 'Upload High-Quality Items',
        description: 'Items in better condition earn more points',
        icon: 'star'
      },
      {
        title: 'Complete Item Descriptions',
        description: 'Detailed descriptions attract more interest',
        icon: 'edit'
      },
      {
        title: 'Take Great Photos',
        description: 'Clear, well-lit photos get more views',
        icon: 'camera'
      },
      {
        title: 'Price Competitively',
        description: 'Fair point values lead to more swaps',
        icon: 'tag'
      },
      {
        title: 'Respond Quickly',
        description: 'Fast responses to swap requests increase success rate',
        icon: 'clock'
      }
    ];

    res.json({
      success: true,
      data: {
        currentPoints: req.user.points,
        potentialEarnings,
        myItems: userItems,
        recommendedItems: interestedItems,
        tips
      },
      message: 'Points opportunities retrieved successfully'
    });
  } catch (error) {
    console.error('Get points opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get points leaderboard
// @route   GET /api/points/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || 'all'; // 'all', 'monthly', 'weekly'

    let matchStage = {};
    
    if (period === 'monthly') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: monthStart };
    } else if (period === 'weekly') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      matchStage.createdAt = { $gte: weekStart };
    }

    // Get top users by points
    const topUsers = await User.find({ isActive: true })
      .sort({ points: -1 })
      .limit(limit)
      .select('name avatar points location')
      .lean();

    // Get current user's rank
    const currentUserRank = await User.countDocuments({
      points: { $gt: req.user.points },
      isActive: true
    }) + 1;

    // Get users with most completed swaps
    const mostActiveUsers = await SwapRequest.aggregate([
      {
        $match: {
          status: 'completed',
          ...matchStage
        }
      },
      {
        $group: {
          _id: '$requesterId',
          swapCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.isActive': true
        }
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          avatar: '$user.avatar',
          location: '$user.location',
          swapCount: 1
        }
      },
      { $sort: { swapCount: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: {
        topUsers,
        mostActiveUsers,
        currentUser: {
          rank: currentUserRank,
          points: req.user.points,
          name: req.user.name
        }
      },
      message: 'Leaderboard retrieved successfully'
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;