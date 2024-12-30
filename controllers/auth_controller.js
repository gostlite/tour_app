const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const catchAsync = require('../utils/catch_async');
const AppError = require('../appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt || undefined,
    role: req.body.role,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('login');
  const { email, password } = req.body;
  //check if email and password exists
  if (!email || !password) {
    console.log('no email or password');
    return next(new AppError('please provide a valid email or password', 400));
  }

  //2 check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); // using the plus sign to select the password
  console.log(user);
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    //doing it this way will prevent an attacker from knowing if the user or password is correct
    return next(new AppError('Incorrect email or password', 401));
  }

  //3 if everything is ok send token to client

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log('this is th token', token);
  if (!token) return next(new AppError("Sorry you aren't logged in", 401));
  //2)verification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // promisify is used to convert the callback function to a promise

  console.log(decoded);

  //3)check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does not exist'),
      401
    );
  }

  //4) check if the user changed password after the token was issued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, please login again', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles in array, admin and lead-guide are tht roles that can access this route
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  console.log(user);
  //2)generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //we must add the save method to save the token to the database after using the createPasswordResetToken method
  await user.save({ validateBeforeSave: false }); // we pass the validateBeforeSave option to false because we dont want to validate the password and confirmPassword fields
  //3) send the token to the user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your email? Please click on the link below to reset your password ${resetUrl}, if you didnt initiate this, kindly ignore. Note this link only lasts for 10mins`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Natour password (valid for 10mins)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token was sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending email', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('token is invalid and expired', 400));
  }

  //2) if token has not expired and there is a user, set the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();
  //3) update changedPasswordAt property for the user
  //4) log the user in,send jwt
  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token: token,
    // data: { user: user },
  });
});
