import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGs9Ww_MbSnt8p1eD9C_OOzU83-0KqNaU",
  authDomain: "applicationverdikt.firebaseapp.com",
  projectId: "applicationverdikt",
  storageBucket: "applicationverdikt.firebasestorage.app",
  messagingSenderId: "510800463654",
  appId: "1:510800463654:web:429b0b8c7f86b17a9f63e7",
  measurementId: "G-67Y1XMCZ1C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;