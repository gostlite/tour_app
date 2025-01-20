// review, createdAt, rating, ref to tour, ref to user

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cant be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: [1, 'The minimum rating is 1'],
      max: [5, "The max value shouldn't be more than "],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Query middleware
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({ path: 'user', select: 'name _id' }).populate({
  //     path: 'tour',
  //     select: 'name id',
  //   });
  this.populate({ path: 'user', select: 'name _id' });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
