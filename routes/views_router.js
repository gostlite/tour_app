const express = require('express');

const router = express.Router();
const viewController = require('../controllers/views_controller');
const authController = require('../controllers/auth_controller');
const bookingController = require('../controllers/booking_controller');

//IS LOGGED IN MIDDLEWARE TO PROTECT OTHER ROUTES EXCEPT THE ME ROUTE
// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.bookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
// router.get('/logout', viewController.getLoginForm);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignUpForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserdata
);

module.exports = router;
