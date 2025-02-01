/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alert.cjs';
const login = async (email, password) => {
  try {
    const res = await axios('http://localhost:3000/api/v1/users/login', {
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
