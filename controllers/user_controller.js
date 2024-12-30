const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const catchAsync = require('../utils/catch_async');
const AppError = require('../appError');

exports.getallUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: { users },
  });
});

exports.getUser = (req, res) => {
  console.log(req.params);

  res
    .status(500)
    .json({ message: 'failed', data: 'Route has not yet been implemented' });
};

exports.updateUser = (req, res) => {
  console.log(req.params);

  res
    .status(500)
    .json({ message: 'failed', data: 'Route has not yet been implemented' });
};

exports.createNewUser = (req, res) => {
  console.log(req.params);

  res
    .status(500)
    .json({ message: 'failed', data: 'Route has not yet been implemented' });
};
exports.deleteUser = (req, res) => {
  console.log(req.params);

  res
    .status(500)
    .json({ message: 'failed', data: 'Route has not yet been implemented' });
};
