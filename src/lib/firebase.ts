// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from 'firebase/firestore';;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfZ9ZBTxCILNqtrVPoc0Wx38yR_OXU8HI",
  authDomain: "admin-balzac.firebaseapp.com",
  projectId: "admin-balzac",
  storageBucket: "admin-balzac.firebasestorage.app",
  messagingSenderId: "146368200980",
  appId: "1:146368200980:web:3c253c1f6242bed6180201",
  measurementId: "G-FN0DBQRTB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db }; 