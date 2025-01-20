const Review = require('../models/review_model');
// const catchAsync = require('../utils/catch_async');
const factory = require('./handler_factory');

exports.getAllReview = factory.getAll(Review);
exports.setTourUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
