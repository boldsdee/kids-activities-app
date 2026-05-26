import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFOpU51nx4gVlSLe3klHvuxFPSQKKjSP8",
  authDomain: "kid-s-activity.firebaseapp.com",
  projectId: "kid-s-activity",
  storageBucket: "kid-s-activity.firebasestorage.app",
  messagingSenderId: "400756169341",
  appId: "1:400756169341:web:a60f870b64726d35acef14",
  measurementId: "G-CX944B973B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
