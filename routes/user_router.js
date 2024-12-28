const express = require('express');

const router = express.Router();

const userController = require('./../controllers/user_controller');
const authController = require('./../controllers/auth_controller');

router.route('/signup').post(authController.signup);

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
