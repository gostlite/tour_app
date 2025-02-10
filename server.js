const dotenv = require('dotenv');
dotenv.config({ path: './.config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  // console.log(err.name, err.message);
  // console.log(err);
  // console.log('UNHANDLED EXCEPTION');

  process.exit(1);
});

const app = require('./app');
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DBPASS);
const DB = process.env.DATABASE_LOCAL;
// console.log(DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connection);
    // console.log(process.env);
    console.log('Connection succedded');
  });

// const testTour = new Tour({
//   name: ' The Forest Hiker',
//   // rating: 4.7,
//   price: 497,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

/////4 start server//////////
const server = app.listen(process.env.PORT, () => {
  // console.log(process.env.PORT);
});

//catching global unhandeled node error
process.on('unhandledRejection', (err) => {
  console.error(err.stack);
  console.log('UNHANDLED REJECTION, SHUTTING DOWN.....');
  server.close(() => {
    process.exit(1);
  });
});

// console.log(c);
