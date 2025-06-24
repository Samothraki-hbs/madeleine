// firebaseAuth.js
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { firebaseApp } from './firebaseConfig';

const auth = getAuth(firebaseApp);

export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA resolved');
        },
      },
      auth
    );
  }
};

export const loginWithPhoneNumber = async (phoneNumber) => {
  setupRecaptcha();
  const appVerifier = window.recaptchaVerifier;
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};