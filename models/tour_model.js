const mongoose = require('mongoose');
const slugify = require('slugify');
const myValidator = require('validator');
// const User = require('./user_model');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: [true, 'a tour cant be duplicated'],
      trim: true,
      maxlength: [40, 'A tour name must not be more than 40 characters'],
      minlength: [10, 'A tour name must be more than 10 characters'],
      validate: {
        validator: function (value) {
          //this will check if all word is alpha
          return value.split(' ').every((word) => myValidator.isAlpha(word));
        },
        message: 'Tour name must contain only Alphabet characters and spaces',
      },
    },
    slug: String,
    duration: { type: Number, required: [true, 'A duration is required'] },
    maxGroupSize: { type: Number, required: [true, 'A duration must be set'] },
    difficulty: {
      type: String,
      required: [true, 'A difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulties are either easy, medium and hard',
      },
    }, //required are validator Important for strings
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be at least 1.0'], //validator for int and date
      max: [5, 'rating must not be more than 5.0'], //validator for int and date
    },
    retingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'price needs to be set'] },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE}) must be less than price',
        validator: function (val) {
          //this only points to current doc when creating a new document
          return val < this.price; //CUSTOM VALIDATOR 250 < 200
        },
      },
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      required: [true, 'a tour must have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'the tour must have a cover image'],
    },
    image: [String],
    createdAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // reviews: { type: mongoose.Schema.ObjectId, ref: 'Review' },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], //reference between different dataset in mongoose
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

//virtual
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//mongo db Document middleware, it runs before the save and create
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });
//we can use multiple middleware or hooks for the document
// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// tourSchema.post('save', function (doc, next) {});

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  // console.log('this is the this ', this);
  next();
});

//POPULATING THE GUIDES FIELD

// tourSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'guides',

//     select: '-__v - passwordChangedAt',
//   });
//   next();
// });

tourSchema.post(/^find/, function (doc, next) {
  console.log(`this is the time it took to find ${Date.now() - this.start}`);
  // console.log(doc);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline()), next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
