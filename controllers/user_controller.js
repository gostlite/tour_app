const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const catchAsync = require('../utils/catch_async');
const AppError = require('../appError');
const factory = require('./handler_factory');

// to filter the body of the request
const filteredObj = (obj, ...allowedFields) => {
  const filterdBody = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) filterdBody[ele] = obj[ele];
  });
  return filterdBody;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) dont allow password updatae here
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for password update', 400));
  }
  //2) filter out unwanted field names not allowd
  const filteredBody = filteredObj(req.body, 'name', 'email');
  //3) update the document
  const newUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
  con;
});

exports.createNewUser = (req, res) => {
  console.log(req.params);

  res.status(500).json({
    message: 'failed',
    data: 'This route is not defined, please use /signup instead',
  });
};
exports.getallUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//Dont use this to update password
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
