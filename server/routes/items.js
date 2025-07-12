const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/Item');
const User = require('../models/User');
const { protect, adminOnly, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/items');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @desc    Get all items with filtering and pagination
// @route   GET /api/items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      status: 'available',
      isApproved: true
    };

    // Apply filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.size) filter.size = req.query.size;
    if (req.query.condition) filter.condition = req.query.condition;
    if (req.query.minPoints) filter.pointsValue = { $gte: parseInt(req.query.minPoints) };
    if (req.query.maxPoints) {
      filter.pointsValue = { ...filter.pointsValue, $lte: parseInt(req.query.maxPoints) };
    }

    // Build sort object
    let sort = {};
    switch (req.query.sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'points-low':
        sort = { pointsValue: 1 };
        break;
      case 'points-high':
        sort = { pointsValue: -1 };
        break;
      case 'popular':
        sort = { likes: -1, views: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const items = await Item.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploaderId', 'name avatar location')
      .lean();

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'Items retrieved successfully'
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured items
// @route   GET /api/items/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const items = await Item.find({
      status: 'available',
      isApproved: true
    })
      .sort({ likes: -1, views: -1 })
      .limit(8)
      .populate('uploaderId', 'name avatar location')
      .lean();

    res.json({
      success: true,
      data: items,
      message: 'Featured items retrieved successfully'
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('uploaderId', 'name avatar location joinedAt')
      .populate('swapRequests');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Only show approved items to non-admin users
    if (!item.isApproved && (!req.user || !req.user.isAdmin)) {
      // Allow owner to see their own items
      if (!req.user || req.user._id.toString() !== item.uploaderId._id.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }
    }

    // Increment views count
    await item.incrementViews();

    res.json({
      success: true,
      data: item,
      message: 'Item retrieved successfully'
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
router.post('/', protect, upload.array('images', 5), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'jackets', 'activewear', 'formal', 'casual', 'other'])
    .withMessage('Invalid category'),
  body('type')
    .isIn(['mens', 'womens', 'kids', 'unisex'])
    .withMessage('Invalid type'),
  body('size')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24'])
    .withMessage('Invalid size'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'worn'])
    .withMessage('Invalid condition')
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

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    const { title, description, category, type, size, condition, tags, pointsValue } = req.body;

    // Process uploaded images
    const images = req.files.map(file => `/uploads/items/${file.filename}`);

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    const item = new Item({
      title,
      description,
      category,
      type,
      size,
      condition,
      tags: parsedTags,
      images,
      uploaderId: req.user._id,
      uploaderName: req.user.name,
      uploaderAvatar: req.user.avatar,
      pointsValue: pointsValue || undefined, // Let the model calculate if not provided
      location: req.user.location
    });

    await item.save();

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully. It will be reviewed by an admin before being listed.'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
router.put('/:id', protect, checkOwnership('id'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .optional()
    .isIn(['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'jackets', 'activewear', 'formal', 'casual', 'other'])
    .withMessage('Invalid category'),
  body('type')
    .optional()
    .isIn(['mens', 'womens', 'kids', 'unisex'])
    .withMessage('Invalid type'),
  body('size')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24'])
    .withMessage('Invalid size'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'worn'])
    .withMessage('Invalid condition')
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

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const { title, description, category, type, size, condition, tags, pointsValue } = req.body;

    // Update fields
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (category !== undefined) item.category = category;
    if (type !== undefined) item.type = type;
    if (size !== undefined) item.size = size;
    if (condition !== undefined) item.condition = condition;
    if (tags !== undefined) item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (pointsValue !== undefined) item.pointsValue = pointsValue;

    // Reset approval status if content was changed
    if (title !== undefined || description !== undefined || category !== undefined) {
      item.isApproved = false;
    }

    await item.save();

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, checkOwnership('id'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Delete associated images
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

// @desc    Like/Unlike item
// @route   POST /api/items/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await item.toggleLike(req.user._id);

    res.json({
      success: true,
      data: {
        likes: item.likes,
        isLiked: item.isLikedBy(req.user._id)
      },
      message: 'Item like status updated'
    });
  } catch (error) {
    console.error('Like item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's items
// @route   GET /api/items/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
      uploaderId: req.params.userId,
      isApproved: true
    };

    // Only show available items to others, show all to owner
    if (!req.user || req.user._id.toString() !== req.params.userId) {
      filter.status = 'available';
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploaderId', 'name avatar location')
      .lean();

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'User items retrieved successfully'
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search items
// @route   GET /api/items/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q: query, category, type, size, condition, minPoints, maxPoints } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search filter
    const filter = {
      $text: { $search: query },
      status: 'available',
      isApproved: true
    };

    // Apply additional filters
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (size) filter.size = size;
    if (condition) filter.condition = condition;
    if (minPoints) filter.pointsValue = { $gte: parseInt(minPoints) };
    if (maxPoints) {
      filter.pointsValue = { ...filter.pointsValue, $lte: parseInt(maxPoints) };
    }

    const items = await Item.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('uploaderId', 'name avatar location')
      .lean();

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      message: 'Search results retrieved successfully'
    });
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;