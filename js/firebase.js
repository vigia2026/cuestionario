import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// PEGA AQUÍ TU CONFIGURACIÓN (Firebase Console > Configuración del proyecto > Tus apps > Web)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZMi6EpP-c61aTCpw9bdEpUS6IXEEjTgY",
  authDomain: "vigia-fdb4a.firebaseapp.com",
  projectId: "vigia-fdb4a",
  storageBucket: "vigia-fdb4a.firebasestorage.app",
  messagingSenderId: "961401821164",
  appId: "1:961401821164:web:e910e5b981669330ef52c9",
  measurementId: "G-B9SBEG7WG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);