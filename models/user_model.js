const crypto = require('crypto');
const mongoose = require('mongoose');
const myValidator = require('validator');
const bcrypt = require('bcryptjs');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: String,
  password: {
    type: String,
    reuired: [true, 'a password is required'],
    minlenght: [8, 'your password should be more than 8 characters'],
    select: false,
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
});

userSchema.methods.correctPassword = async function (
  // this method will be availbale on all document of User
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    console.log(changedTimeStamp, jwtTimeStamp);
    return jwtTimeStamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
