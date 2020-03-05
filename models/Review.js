const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please enter a title'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please enter some text'],
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please enter a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
