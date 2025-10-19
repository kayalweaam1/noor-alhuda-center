import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDwEBJqX3AQlwwdF5pVOjGp72zqQNH5ZY0",
  authDomain: "nour-al-huda-center-v2.firebaseapp.com",
  projectId: "nour-al-huda-center-v2",
  storageBucket: "nour-al-huda-center-v2.firebasestorage.app",
  messagingSenderId: "911057244045",
  appId: "1:911057244045:web:57466197118ccf95c6b7c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;

