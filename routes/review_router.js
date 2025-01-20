const express = require('express');
const reviewController = require('../controllers/review_controller');
const authController = require('../controllers/auth_controller');
const router = express.Router({ mergeParams: true }); // setting the merge params to true, to do the merging

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserId,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
