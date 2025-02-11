const express = require('express');
const bookingController = require('../controllers/booking_controller');
const authController = require('../controllers/auth_controller');
const router = express.Router(); // setting the merge params to true, to do the merging

router.use(authController.protect);
router
  .route('/checkout-session/:tourId')
  .get(bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteOneBooking);

module.exports = router;
