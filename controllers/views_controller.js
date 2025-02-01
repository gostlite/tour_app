const catchAsync = require('../utils/catch_async');
const Tour = require('../models/tour_model');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  console.log(tour.images);
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    user: 'Your mind go dey',
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
