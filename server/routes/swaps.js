const express = require('express');
const { body, validationResult } = require('express-validator');
const SwapRequest = require('../models/SwapRequest');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's swap requests (both sent and received)
// @route   GET /api/swaps/requests
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, status } = req.query;
    
    let filter = {
      $or: [
        { requesterId: userId },
        { itemOwnerId: userId }
      ]
    };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await SwapRequest.find(filter)
      .populate('requesterId', 'name avatar')
      .populate('itemOwnerId', 'name avatar')
      .populate('itemId', 'title images pointsValue')
      .populate('offeredItemId', 'title images pointsValue')
      .sort({ createdAt: -1 });

    // Separate into sent and received
    const sentRequests = requests.filter(req => req.requesterId._id.toString() === userId.toString());
    const receivedRequests = requests.filter(req => req.itemOwnerId._id.toString() === userId.toString());

    res.json({
      success: true,
      data: {
        sent: sentRequests,
        received: receivedRequests,
        total: requests.length
      },
      message: 'Swap requests retrieved successfully'
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a new swap request
// @route   POST /api/swaps/request
// @access  Private
router.post('/request', protect, [
  body('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),
  body('type')
    .isIn(['item-swap', 'point-redemption'])
    .withMessage('Invalid swap type'),
  body('offeredItemId')
    .optional()
    .isMongoId()
    .withMessage('Invalid offered item ID'),
  body('pointsOffered')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points offered must be a non-negative integer'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { itemId, type, offeredItemId, pointsOffered, message } = req.body;
    const requesterId = req.user._id;

    // Get the requested item
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
        message: 'Item is not available for swapping'
      });
    }

    // Check if user is trying to request their own item
    if (item.uploaderId.toString() === requesterId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own item'
      });
    }

    // Check if there's already a pending request for this item from this user
    const existingRequest = await SwapRequest.findOne({
      itemId,
      requesterId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this item'
      });
    }

    let offeredItem = null;
    if (type === 'item-swap') {
      if (!offeredItemId) {
        return res.status(400).json({
          success: false,
          message: 'Offered item ID is required for item swaps'
        });
      }

      offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem) {
        return res.status(404).json({
          success: false,
          message: 'Offered item not found'
        });
      }

      // Check if offered item belongs to the requester
      if (offeredItem.uploaderId.toString() !== requesterId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only offer items that belong to you'
        });
      }

      // Check if offered item is available
      if (offeredItem.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Offered item is not available'
        });
      }
    } else if (type === 'point-redemption') {
      if (!pointsOffered || pointsOffered <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Points offered must be greater than 0 for point redemption'
        });
      }

      // Check if user has enough points
      if (req.user.points < pointsOffered) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient points'
        });
      }

      // Check if points offered meet the minimum requirement
      if (pointsOffered < item.pointsValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum ${item.pointsValue} points required for this item`
        });
      }
    }

    // Create the swap request
    const swapRequest = new SwapRequest({
      requesterId,
      requesterName: req.user.name,
      requesterAvatar: req.user.avatar,
      itemId,
      itemOwnerId: item.uploaderId,
      itemTitle: item.title,
      itemImages: item.images,
      offeredItemId: offeredItem ? offeredItem._id : null,
      offeredItemTitle: offeredItem ? offeredItem.title : null,
      offeredItemImages: offeredItem ? offeredItem.images : [],
      pointsOffered: pointsOffered || 0,
      type,
      message
    });

    await swapRequest.save();

    // Update the item to include this swap request
    item.swapRequests.push(swapRequest._id);
    await item.save();

    // Populate the created request for response
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterId', 'name avatar')
      .populate('itemOwnerId', 'name avatar')
      .populate('itemId', 'title images pointsValue')
      .populate('offeredItemId', 'title images pointsValue');

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request created successfully'
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Respond to a swap request (accept/reject)
// @route   PUT /api/swaps/request/:id
// @access  Private
router.put('/request/:id', protect, [
  body('response')
    .isIn(['accept', 'reject'])
    .withMessage('Response must be either "accept" or "reject"'),
  body('responseMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response message cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { response, responseMessage } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user owns the item
    if (swapRequest.itemOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to requests for your own items'
      });
    }

    // Check if request can be responded to
    if (!swapRequest.canRespond()) {
      return res.status(400).json({
        success: false,
        message: 'This request cannot be responded to (expired or already responded)'
      });
    }

    if (response === 'accept') {
      await swapRequest.accept(responseMessage);
      
      // Update item status to pending
      const item = await Item.findById(swapRequest.itemId);
      item.status = 'pending';
      await item.save();

      // If it's an item swap, also update the offered item status
      if (swapRequest.type === 'item-swap' && swapRequest.offeredItemId) {
        const offeredItem = await Item.findById(swapRequest.offeredItemId);
        offeredItem.status = 'pending';
        await offeredItem.save();
      }

      res.json({
        success: true,
        data: swapRequest,
        message: 'Swap request accepted successfully'
      });
    } else {
      await swapRequest.reject(responseMessage);
      
      res.json({
        success: true,
        data: swapRequest,
        message: 'Swap request rejected'
      });
    }
  } catch (error) {
    console.error('Respond to swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Complete a swap
// @route   PUT /api/swaps/:id/complete
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the swap
    if (
      swapRequest.requesterId.toString() !== req.user._id.toString() &&
      swapRequest.itemOwnerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this swap'
      });
    }

    // Check if swap is accepted
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Swap must be accepted before it can be completed'
      });
    }

    // Complete the swap
    await swapRequest.complete();

    // Update item statuses
    const item = await Item.findById(swapRequest.itemId);
    item.status = 'swapped';
    await item.save();

    if (swapRequest.type === 'item-swap' && swapRequest.offeredItemId) {
      const offeredItem = await Item.findById(swapRequest.offeredItemId);
      offeredItem.status = 'swapped';
      await offeredItem.save();
    }

    // Handle points transaction for point redemption
    if (swapRequest.type === 'point-redemption') {
      const requester = await User.findById(swapRequest.requesterId);
      const itemOwner = await User.findById(swapRequest.itemOwnerId);

      // Deduct points from requester
      await requester.spendPoints(swapRequest.pointsOffered);
      
      // Award points to item owner
      await itemOwner.addPoints(swapRequest.pointsOffered);
    }

    res.json({
      success: true,
      data: swapRequest,
      message: 'Swap completed successfully'
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel a swap request
// @route   DELETE /api/swaps/request/:id
// @access  Private
router.delete('/request/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (swapRequest.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own swap requests'
      });
    }

    // Check if request can be cancelled
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    // Cancel the request
    await swapRequest.cancel();

    res.json({
      success: true,
      message: 'Swap request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get swap history
// @route   GET /api/swaps/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { requesterId: userId },
        { itemOwnerId: userId }
      ],
      status: 'completed'
    };

    const history = await SwapRequest.find(filter)
      .populate('requesterId', 'name avatar')
      .populate('itemOwnerId', 'name avatar')
      .populate('itemId', 'title images pointsValue')
      .populate('offeredItemId', 'title images pointsValue')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SwapRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        swaps: history,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'Swap history retrieved successfully'
    });
  } catch (error) {
    console.error('Get swap history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get swap details
// @route   GET /api/swaps/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requesterId', 'name avatar location')
      .populate('itemOwnerId', 'name avatar location')
      .populate('itemId', 'title images pointsValue description')
      .populate('offeredItemId', 'title images pointsValue description');

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the swap
    if (
      swapRequest.requesterId._id.toString() !== req.user._id.toString() &&
      swapRequest.itemOwnerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this swap'
      });
    }

    res.json({
      success: true,
      data: swapRequest,
      message: 'Swap details retrieved successfully'
    });
  } catch (error) {
    console.error('Get swap details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;