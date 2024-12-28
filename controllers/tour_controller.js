// const fs = require('fs');
const AppError = require('../appError');
const Tour = require('./../models/tour_model');
const ApiFeatures = require('./../utils/api_features');
const catchAsync = require('./../utils/catch_async');

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

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingAverage, summary,difficulty';
  next();
};
exports.getallTours = catchAsync(async (req, res) => {
  // //when no more items
  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('No more documents found');
  // }
  // EXECUTE QUERY
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .field()
    .paginate();
  //
  const tours = await features.query;
  res.status(200).json({
    name: 'Tours',

    result: tours.length,
    data: {
      tours,
    },
  });
});
//ASYNC ERROR HANDLING

exports.createNewTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({})
  // newTour.save()
  // try {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'successful',
    data: { newTour },
  });
  // } catch (error) {
  //   res.status(400).json({
  //     message: error,
  //   });
  // }
});
exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError(`No tour was found with this id ${id}`, 404));
  }

  res.status(200).json({ message: 'success', data: tour });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true, // runing the validator
  });
  if (!tour) {
    return next(new AppError(`No tour was found with this id ${id}`, 404));
  }
  res.status(200).json({ message: 'success', data: tour });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError(`No tour was found with this id ${id}`, 404));
  }
  res
    .status(204)
    .json({ message: 'success', detail: `${id} deleted`, data: null });
});

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
