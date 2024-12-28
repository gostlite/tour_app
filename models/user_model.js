const mongoose = require('mongoose');
const myValidator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a name is required'],
    trim: true,
    minlenght: [2, 'The minimum characters for a name is 2'],
    maxlenght: [40, 'The characters shouldn"t be more than 40'],
    validate: {
      validator: function (value) {
        return value.split(' ').every((val) => myValidator.isAlpha(val));
      },
      message: 'The name must always be an alphabetical character',
    },
  },
  email: {
    type: String,
    unique: [true, 'This email already exists'],
    required: [true, 'an email is required'],
    trim: true,
    lowercase: true,
    validate: [myValidator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    reuired: [true, 'a password is required'],
    minlenght: [8, 'your password should be more than 8 characters'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'a confirm password is required'],
    validate: {
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'Password doesnt match',
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
