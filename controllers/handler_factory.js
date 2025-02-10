const catchAsync = require('./../utils/catch_async');
const AppError = require('./../appError');
const ApiFeatures = require('./../utils/api_features');
const { models } = require('mongoose');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new AppError(`No document was found with this id ${id}`, 404)
      );
    }
    res
      .status(204)
      .json({ message: 'success', detail: `${id} deleted`, data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true, // runing the validator
    });
    if (!doc) {
      return next(
        new AppError(`No document was found with this id ${id}`, 404)
      );
    }
    res.status(200).json({ message: 'success', data: doc });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save()
    // try {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'successful',
      data: { doc },
    });
    // } catch (error) {
    //   res.status(400).json({
    //     message: error,
    //   });
    // }
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    // const tour = await Tour.findById(id).populate({
    //   path: 'reviews',
    //   select: '-__v',
    // });
    if (!doc) {
      return next(
        new AppError(`No document was found with this id ${id}`, 404)
      );
    }

    res.status(200).json({ message: 'success', data: doc });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow nested Get reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // //when no more items
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('No more documents found');
    // }
    // EXECUTE QUERY
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .field()
      .paginate();
    //
    const doc = await features.query;
    res.status(200).json({
      // name: models.toString(),
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
