import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZV8Znj-sZkJZVuhKRsp_JHARX7aeyCCY",
  authDomain: "dulcet-opus-461713-n0.firebaseapp.com",
  projectId: "dulcet-opus-461713-n0",
  storageBucket: "dulcet-opus-461713-n0.appspot.com",
  messagingSenderId: "122426031888",
  appId: "1:122426031888:web:ca1e7b239963975d19af95",
  measurementId: "G-1KE1LPSGGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
