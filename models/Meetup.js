const mongoose = require('mongoose');

const MeetupSchema = new mongoose.Schema({
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
    type: Number,
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
    default: Date.now,
    immutable: true
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  }
});

// Static method to get average of meetup costs for a specific group
MeetupSchema.statics.getAverageCost = async function(groupId) {
  const obj = await this.aggregate([
    { $match: { group: groupId } },
    { $group: { _id: '$group', averageCost: { $avg: '$cost' } } }
  ]);

  try {
    await this.model('Group').findByIdAndUpdate(
      groupId,
      obj[0]
        ? {
            averageCost: Math.ceil(obj[0].averageCost)
          }
        : { averageCost: undefined }
    );
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after saving a meetup
MeetupSchema.post('save', async function() {
  await this.constructor.getAverageCost(this.group);
});

// Call getAverageCost after deleting a meetup
MeetupSchema.post('remove', async function() {
  await this.constructor.getAverageCost(this.group);
});

module.exports = mongoose.model('Meetup', MeetupSchema);
