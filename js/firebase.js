import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig={
  apiKey:"AIzaSyAZMi6epP-c61aTCpw9bdEpUS6IXEEjTgY",
  authDomain:"vigia-fdb4a.firebaseapp.com",
  projectId:"vigia-fdb4a",
  storageBucket:"vigia-fdb4a.firebasestorage.app",
  messagingSenderId:"961401821164",
  appId:"1:961401821164:web:e910e5b981669330ef52c9"
};

const app=initializeApp(firebaseConfig);
export const db=getFirestore(app),auth=getAuth(app);
