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
const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    staus: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};
const sendErrorProd = (res, err) => {
  //operational, trusted error:send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      staus: err.status,
      message: err.message,
    });
  } //programming, unknown error
  else {
    //1) log the error
    // console.error("Error ('_')", err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err.stack);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name }; // this will copy all values from err, including the non-enurable ones like name
    console.log(error.name);
    if (error.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredToken();
    sendErrorProd(res, error);
  }
};
