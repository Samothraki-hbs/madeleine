// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import * as Notifications from 'expo-notifications';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByeLPWumsQb1MNJJgMfUkDvImWzTrJXjs",
  authDomain: "madeleine-ad45a.firebaseapp.com",
  projectId: "madeleine-ad45a",
  storageBucket: "madeleine-ad45a.firebasestorage.app",
  messagingSenderId: "619679592296",
  appId: "1:619679592296:web:c55d754ae46c5ac58d30dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { Notifications };