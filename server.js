const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.config.env' });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION');

  process.exit(1);
});

const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DBPASS);

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
const port = 3000;

/////4 start server//////////
const server = app.listen(port, () => {
  console.log(port);
});

//catching global unhandeled node error
process.on('unhandledRejection', (err) => {
  console.error(err.name, err.message);
  console.log('UNHANDLED REJECTION, SHUTTING DOWN.....');
  server.close(() => {
    process.exit(1);
  });
});

// console.log(c);
