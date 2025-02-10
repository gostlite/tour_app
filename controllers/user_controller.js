// const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/user_model');
const catchAsync = require('../utils/catch_async');
const AppError = require('../appError');
const factory = require('./handler_factory');
const sharp = require('sharp');

//MULTER DISK STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload an image file', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); //UPLOAD IMAGES

exports.uploadUserPhoto = upload.single('photo');

//RESIZE USER PHOTO
exports.resizeUserPhoto = (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file) next();
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

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
  console.log(req.file);
  console.log(req.body);
  //1) dont allow password updatae here
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for password update', 400));
  }
  //2) filter out unwanted field names not allowd
  const filteredBody = filteredObj(req.body, 'name', 'email');
  //2b) saving the image path path
  if (req.file) filteredBody.photo = req.file.filename;
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
