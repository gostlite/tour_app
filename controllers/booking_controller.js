const AppError = require('../appError');
const Tour = require('../models/tour_model');
const Booking = require('../models/booking_model');

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Stripe = require('stripe');

// Initialize Stripe with the API key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catch_async');
const factory = require('./handler_factory');
const User = require('../models/user_model');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the tour by ID
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Create the Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // Required for one-time payments
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`, // Redirect after successful payment
    success_url: `${req.protocol}://${req.get('host')}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // Redirect if payment is canceled
    customer_email: req.user.email, // Use the logged-in user's email
    client_reference_id: req.params.tourId, // Reference to the tour ID
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
  });

  // 3) Send the session as a response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.bookingCheckout = catchAsync(async (req, res, next) => {
//   //this is only TEMPORARY, COS EVERYONE CAN MAKE A BOOKING WITHOUT PAYING
//   const { price, tour, user } = req.query;
//   if (!price || !tour || !user) return next();
//   await Booking.create({ price, tour, user });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const bookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = User.findOne({ email: session.customer_email }).id;
  const price = session.line_items[0].price / 100;
  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = async (res, req, next) => {
  const signature = req.header['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.SIGNING_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook Error ${error.message}`);
  }
  if (event.type === 'checkout.session.complete') {
    bookingCheckout(event.data.object);
    res.status(200).json({ received: true });
  }
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
