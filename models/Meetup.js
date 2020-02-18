const mongoose = require('mongoose');

const MeetupSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a meetup title'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  hours: {
    type: String,
    required: [true, 'Please add number of hours']
  },
  cost: {
    type: String,
    required: [true, 'Please add a cost']
  },
  minExperience: {
    type: String,
    required: [true, 'Please add a minimum experience level'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  newMembers: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  }
});

module.exports = mongoose.model('Meetup', MeetupSchema);
