// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGRiUdgJMHMSj8QnPZia-hbRaU9XuxYbM",
  authDomain: "ai-professor-login.firebaseapp.com",
  projectId: "ai-professor-login",
  storageBucket: "ai-professor-login.appspot.com",
  messagingSenderId: "738373707833",
  appId: "1:738373707833:web:e67723ea5b2f0520ee45e8",
  measurementId: "G-56MKTCCS4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});
const auth = getAuth(app);

export { app, analytics, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };