const catchAsync = require('../utils/catch_async');
const Tour = require('../models/tour_model');
const AppError = require('../appError');
const User = require('../models/user_model');
const Booking = require('../models/booking_model');
const factory = require('./handler_factory');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Get data for requested tour (+reviews, +guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('This tour does not exist!', 404));

  // Render template using data retrieved
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000/")
    .render('login', {
      title: 'Login form',
    });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up form',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Account Information',
  });
};

exports.updateUserdata = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Account Information',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2)find tours with returned bookings
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', {
    title: 'All Booked Tours',
    tours,
  });
});
