///VARIABLE

import axios from 'axios';
import { showAlert } from './alert.js';

// import axios from "axios"

export const updateSetting = async (data, type) => {
  if (!data) showAlert('error', 'Please dont leave your name or email blank');

  const url =
    type === 'password'
      ? 'http://localhost:3000/api/v1/users/updatePassword'
      : 'http://localhost:3000/api/v1/users/updateMe';
  try {
    const res = await axios(url, {
      method: 'PATCH',
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Successfully changed data`);
      // window.setTimeout(() => {
      //   location.assign('/');
      // }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
