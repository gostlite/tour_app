// review, createdAt, rating, ref to tour, ref to user

const mongoose = require('mongoose');
const Tour = require('./tour_model');

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
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // having  a unique tour and id for a user to a tour
//Query middleware
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({ path: 'user', select: 'name _id' }).populate({
  //     path: 'tour',
  //     select: 'name id',
  //   });
  this.populate({ path: 'user', select: 'name _id photo' });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //calculating the review sum and average
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //this.r = await this.findOne(); does not work here, the query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
