/* eslint-disable */
// import axios from 'axios';

import axios from 'axios';
import { showAlert } from './alert.js';
// const loginForm = document.querySelector('.form');

export const login = async (email, password) => {
  try {
    const res = await axios('/api/v1/users/login', {
      method: 'POST',
      data: {
        email,
        password,
      },
    });
    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Successfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    if (res.data.status === 'success') {
      showAlert('success', 'successfully logged out');

      location.reload(true);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message || 'Error logging out, please try again later'
    );
  }
};

// loginForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });
