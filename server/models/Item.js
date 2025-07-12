const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'jackets', 'activewear', 'formal', 'casual', 'other'],
      message: 'Invalid category'
    }
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['mens', 'womens', 'kids', 'unisex'],
      message: 'Invalid type'
    }
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: {
      values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24'],
      message: 'Invalid size'
    }
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['new', 'like-new', 'good', 'fair', 'worn'],
      message: 'Invalid condition'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Each tag cannot exceed 20 characters']
  }],
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderName: {
    type: String,
    required: true
  },
  uploaderAvatar: {
    type: String,
    default: null
  },
  pointsValue: {
    type: Number,
    required: true,
    min: [1, 'Points value must be at least 1'],
    max: [1000, 'Points value cannot exceed 1000']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'pending', 'swapped', 'removed'],
      message: 'Invalid status'
    },
    default: 'available'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  swapRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest'
  }],
  rejectionReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
itemSchema.index({ uploaderId: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ size: 1 });
itemSchema.index({ condition: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ isApproved: 1 });
itemSchema.index({ pointsValue: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ views: -1 });
itemSchema.index({ likes: -1 });

// Text search index
itemSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Virtual for swap request count
itemSchema.virtual('swapRequestCount').get(function() {
  return this.swapRequests.length;
});

// Method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
itemSchema.methods.toggleLike = function(userId) {
  const likedIndex = this.likedBy.indexOf(userId);
  
  if (likedIndex === -1) {
    this.likedBy.push(userId);
    this.likes += 1;
  } else {
    this.likedBy.splice(likedIndex, 1);
    this.likes -= 1;
  }
  
  return this.save();
};

// Method to check if user has liked the item
itemSchema.methods.isLikedBy = function(userId) {
  return this.likedBy.includes(userId);
};

// Method to calculate points based on condition and category
itemSchema.methods.calculatePoints = function() {
  let basePoints = 10;
  
  // Condition multiplier
  const conditionMultiplier = {
    'new': 1.5,
    'like-new': 1.2,
    'good': 1.0,
    'fair': 0.8,
    'worn': 0.6
  };
  
  // Category multiplier
  const categoryMultiplier = {
    'formal': 1.3,
    'shoes': 1.2,
    'jackets': 1.2,
    'dresses': 1.1,
    'accessories': 0.9,
    'other': 0.8
  };
  
  const conditionMult = conditionMultiplier[this.condition] || 1.0;
  const categoryMult = categoryMultiplier[this.category] || 1.0;
  
  return Math.ceil(basePoints * conditionMult * categoryMult);
};

// Pre-save hook to calculate points if not set
itemSchema.pre('save', function(next) {
  if (!this.pointsValue) {
    this.pointsValue = this.calculatePoints();
  }
  next();
});

// Ensure virtuals are included in JSON output
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);