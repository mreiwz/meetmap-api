const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please enter a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone cannot be more than 20 digits']
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email address'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false,
        index: '2dsphere'
      },
      // MapQuest API
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    focus: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Eurogames',
        'Ameritrash',
        'Train Games',
        'Party Games',
        'Miniature Games',
        'RPGs',
        'Campaign Games',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    teaching: {
      type: Boolean,
      default: false
    },
    ownLibrary: {
      type: Boolean,
      default: false
    },
    purchaseMin: {
      type: Boolean,
      default: false
    },
    acceptNew: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Mongoose middleware: create group slug from submitted name
GroupSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Mongoose middleware: geocoding and create location field
GroupSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };
  // Do not save user-input address in database
  this.address = undefined;
  next();
});

// Mongoose middleware: cascade delete meetups when a group is deleted
GroupSchema.pre('remove', async function(next) {
  console.log(`Middleware running: deleting meetups from group ${this._id}`);
  await this.model('Meetup').deleteMany({ group: this._id });
  next();
});

// Reverse populate with virtuals
GroupSchema.virtual('meetups', {
  ref: 'Meetup',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

module.exports = mongoose.model('Group', GroupSchema);
