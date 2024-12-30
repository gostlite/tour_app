const express = require('express');

const app = express();
const morgan = require('morgan');
const AppError = require('./appError');
const globalErrorHandler = require('./controllers/error_controllers');
//1 middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
  req.reuestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

//2 ROUTES
const tourRouter = require('./routes/tour_router');
const userRouter = require('./routes/user_router');
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
