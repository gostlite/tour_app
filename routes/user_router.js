const express = require('express');

const router = express.Router();

const userController = require('./../controllers/user_controller');
const authController = require('./../controllers/auth_controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);

//protect all routes
router.use(authController.protect);
router.get('/logout', authController.logout);
router.patch(
  '/updatePassword',

  authController.updatePassword
);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get(
  '/me',

  userController.getMe,
  userController.getUser
);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//restrict to
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getallUsers)
  .post(userController.createNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
