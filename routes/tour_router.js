const express = require('express');
const tourController = require('./../controllers/tour_controller');
const authController = require('./../controllers/auth_controller');
const reviewRouter = require('./../routes/review_router');

const router = express.Router();

// router.param('id', tourController.checkId);

// NOT NEEDED BECAUSE OF THE MERGE PARAMS THAT WILL DO THE TRICK
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user', 'admin'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getallTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/tour-within/:distance/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(
  // tourController.getToursWithin
  tourController.getDistances
);
router
  .route('/')
  .get(tourController.getallTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,

    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
