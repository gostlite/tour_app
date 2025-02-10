const AppError = require('../appError');

const handleCastErrorDb = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
  const message = `The name "${err.keyValue.name}" already exists and cannot be used`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `invalid input: ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('invalid token, please login again', 401);

const handleJwtExpiredToken = () => {
  new AppError('Your token is expired, please login again', 401);
};
const sendErrorDev = (err, req, res) => {
  //API ROUTES
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
    //RENDERED ROUTES
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Uh oh! Something went wrong!',
      msg: err.message,
    });
  }
};
const sendErrorProd = (err, req, res) => {
  //A) FOR THE APIS
  if (req.originalUrl.startsWith('/api')) {
    //operational, trusted error:send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        msg: err.message,
      });
    } //programming, unknown error

    //1) log the error
    // console.error("Error ('_')", err);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong',
    });
  } //B) FOR THE RENDERED WEBSITE
  else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Uh oh! Something went wrong!',
        msg: err.message,
      });
    } //programming, unknown error

    //1) log the error
    // console.error("Error ('_')", err);
    return res.status(500).render('error', {
      title: 'Uh oh! Something went wrong!',
      msg: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err.stack);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message }; // this will copy all values from err, including the non-enurable ones like name
    console.log(error.name);
    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredToken();
    sendErrorProd(error, req, res);
  }
};
