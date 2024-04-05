// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

// Import Firestore library
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgMKTSNPY-fxQdt65b_7_ozcv32H5xOVw",
  authDomain: "final-project-c189b.firebaseapp.com",
  projectId: "final-project-c189b",
  storageBucket: "final-project-c189b.appspot.com",
  messagingSenderId: "462082775891",
  appId: "1:462082775891:web:ffb9b2c516eabff357dfa6"
};


const app = initializeApp(firebaseConfig);
// Initialize Firebase Services (database, auth, etc)
const db = getFirestore(app);
const auth = getAuth(app)

export { db, auth }