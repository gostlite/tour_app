/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alert.cjs';
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
      alert('Successfully logged in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert(error.response.data.message);
  }
};
