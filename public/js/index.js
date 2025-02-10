import '@babel/polyfill';
import { login, logout } from './login.js';
import { updateSetting } from './update-settings.js';
import displayMap from './leaflet.js';
import { bookTour } from './stripe.js';

const loginForm = document.querySelector('.form--login');
const map = document.getElementById('map');
const logoutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSetting(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save--password ').textContent =
      'Updating .....';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updateSetting({ password, newPassword, confirmPassword }, 'password');

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save--password ').textContent =
      'Save Password';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing.....';
    console.log(e.target);
    const { tourId } = e.target.dataset;
    console.log('here is the tour id ', tourId);
    bookTour(tourId);
  });
}
