const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterAvatar: {
    type: String,
    default: null
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemTitle: {
    type: String,
    required: true
  },
  itemImages: [{
    type: String
  }],
  offeredItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  offeredItemTitle: {
    type: String,
    default: null
  },
  offeredItemImages: [{
    type: String
  }],
  pointsOffered: {
    type: Number,
    min: [0, 'Points offered cannot be negative'],
    default: 0
  },
  type: {
    type: String,
    enum: {
      values: ['item-swap', 'point-redemption'],
      message: 'Invalid swap type'
    },
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      message: 'Invalid status'
    },
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  },
  respondedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Swap requests expire after 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  meetingDetails: {
    location: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Meeting notes cannot exceed 200 characters']
    }
  },
  rating: {
    fromRequester: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [200, 'Rating comment cannot exceed 200 characters']
      }
    },
    fromOwner: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [200, 'Rating comment cannot exceed 200 characters']
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
swapRequestSchema.index({ requesterId: 1 });
swapRequestSchema.index({ itemOwnerId: 1 });
swapRequestSchema.index({ itemId: 1 });
swapRequestSchema.index({ status: 1 });
swapRequestSchema.index({ type: 1 });
swapRequestSchema.index({ createdAt: -1 });
swapRequestSchema.index({ expiresAt: 1 });

// Compound indexes
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ itemOwnerId: 1, status: 1 });

// Virtual for checking if request is expired
swapRequestSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt && this.status === 'pending';
});

// Method to accept the swap request
swapRequestSchema.methods.accept = function(responseMessage) {
  this.status = 'accepted';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  return this.save();
};

// Method to reject the swap request
swapRequestSchema.methods.reject = function(responseMessage) {
  this.status = 'rejected';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  return this.save();
};

// Method to complete the swap
swapRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel the swap request
swapRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Method to check if the request can be responded to
swapRequestSchema.methods.canRespond = function() {
  return this.status === 'pending' && !this.isExpired;
};

// Method to set meeting details
swapRequestSchema.methods.setMeetingDetails = function(location, date, notes) {
  this.meetingDetails = {
    location,
    date: new Date(date),
    notes
  };
  return this.save();
};

// Method to add rating
swapRequestSchema.methods.addRating = function(fromUserId, rating, comment) {
  const isRequester = fromUserId.toString() === this.requesterId.toString();
  
  if (isRequester) {
    this.rating.fromRequester = { rating, comment };
  } else {
    this.rating.fromOwner = { rating, comment };
  }
  
  return this.save();
};

// Pre-save hook to automatically expire old pending requests
swapRequestSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
  }
  next();
});

// Static method to find expired requests
swapRequestSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });
};

// Static method to expire old pending requests
swapRequestSchema.statics.expireOldRequests = function() {
  return this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Ensure virtuals are included in JSON output
swapRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);