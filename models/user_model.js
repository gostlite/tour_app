const crypto = require('crypto');
const mongoose = require('mongoose');
const myValidator = require('validator');
const bcrypt = require('bcryptjs');

// ----------------------------------------------
// Create schema
// ----------------------------------------------

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please inform your name'],
    validator: function (value) {
      // Trim leading/trailing spaces and split into words
      const words = value.trim().split(/\s+/);

      // Check if every word contains only alphabetical characters (including hyphens and accents)
      return words.every((word) => /^[A-Za-z\u00C0-\u017F'-]+$/.test(word));
    },
    message: 'The name must contain only letters, hyphens, and apostrophes.',
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [myValidator.isEmail, 'Please inform a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    select: false,
    validate: {
      // this validation works only on create() or save()
      validator: function (el) {
        return el === this.password;
      },
      message: 'The passwords must match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// ----------------------------------------------
// Middlewares
// ----------------------------------------------

// ----------------------------------------------
// Encrypt password

userSchema.pre('save', async function (next) {
  // Run this funcion only if password was modified
  if (!this.isModified('password')) return next();

  // Hash the password and delete confirmPassword
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = null; // undefined
  next();
});

// ----------------------------------------------
// Update password changed

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // hack to prevent errors due to db update
  next();
});

// ----------------------------------------------
// Filter inactive users from queries

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ----------------------------------------------
// Instance Methods
// ----------------------------------------------

// ----------------------------------------------
// Validate password

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ----------------------------------------------
// Verify if password was changed after token

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // Check if the password was changed after token creation
    return JWTTimestamp < changedTimestamp;
  }

  // Password not changed
  return false;
};

// ----------------------------------------------
// Create password reset token

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 600000; // expires in 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
