const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const app = express();
const morgan = require('morgan');
const AppError = require('./appError');
const globalErrorHandler = require('./controllers/error_controllers');
//1 middleware

// SECURE HTTP HEADER
app.use(helmet());
// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//LIMIT REQUEST FROM AN IP TO AN API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip, please try again in 1 hour',
});

app.use('/api', limiter);
// BODY PARSER READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10KB' }));

// DATA SANITISE AGAINST NO SQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xssClean());

// PREVENT PARAMETER POLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//SERVING STATIC FILE
app.use(express.static(`${__dirname}/public`));
//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.reuestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//2 ROUTES
const tourRouter = require('./routes/tour_router');
const userRouter = require('./routes/user_router');
const reviewRouter = require('./routes/review_router');
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `the requested page ${req.originalUrl} could not be found`,
  // });
  // next();
  // const err = Error(`the specified url ${req.originalUrl} does not exist `);
  // err.statusCode = 404;
  // err.status = 'failed';

  next(
    new AppError(`the specified url ${req.originalUrl} does not exist `, 404)
  );
});

//CREATING A DYNAMIC ROYUTE HANDLER FOR ERROR

app.use(globalErrorHandler);
/////////2 functions////////

// app.get('/api/v1/tours', getallTours);

// app.post('/api/v1/tours', createNewTour);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('api/v1/tours/:id', deleteTour);

////3 routes/////////////

module.exports = app;
