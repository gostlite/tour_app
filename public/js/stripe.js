import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js'; // Import Stripe.js
import { showAlert } from './alert';

// Initialize Stripe with your publishable key

export const bookTour = async (tourId) => {
  console.log('here is the tour id ', tourId);

  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    //await stripe.redirectToCheckout({
    //  sessionId: session.data.session.id,
    //});

    //works as expected
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
