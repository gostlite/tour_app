// const fs = require('fs');
const { path } = require('../app');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../appError');
const Tour = require('./../models/tour_model');
const ApiFeatures = require('./../utils/api_features');
const catchAsync = require('./../utils/catch_async');
const factory = require('./handler_factory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   console.log(`this is the id ${id}`);
//   console.log(`this is the val ${val}`);
//   console.log(id === val * 1);
//   if (tours.length < id) {
//     return res.status(404).json({
//       status: 'error',
//       message: 'not found',
//     });
//   }
//   next();
// };

//MULTER CONFIG
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload an image file', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); //UPLOAD IMAGES
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) next();

  //IMAGE COVER
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) IMAGES
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (image, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(image.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    })
  );

  next();
});
exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingAverage, summary,difficulty';
  next();
};

exports.getallTours = factory.getAll(Tour);
//ASYNC ERROR HANDLING

exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
  select: '-__v',
});
exports.createNewTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;

//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) {
//     return next(new AppError(`No tour was found with this id ${id}`, 404));
//   }
//   res
//     .status(204)
//     .json({ message: 'success', detail: `${id} deleted`, data: null });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        // _id: '$ratingAverage',
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    //you can still reuse the operator
    // { $match: { _id: { $ne: 'easy' } } },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-30`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } }, // for removing a generated field from the pipeline
    { $sort: { numTourStarts: -1 } }, // sorting via descending is -1 while Ascending is 1
    { $limit: 6 },
  ]);
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in a format like lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(lat, lng);
  res.status(200).json({
    result: tours.length,
    status: 'success',
    data: tours,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in a format like lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point', // Corrected type
          coordinates: [lng * 1, lat * 1], // Longitude and latitude
        },
        distanceField: 'distance', // Field to store computed distances
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  console.log(lat, lng);
  res.status(200).json({
    result: distances.length,
    status: 'success',
    data: distances,
  });
});
