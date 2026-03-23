import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3C8fSicqTsbhVIRaudLbUk-4AfcaPwiI",
  authDomain: "leixoes-gestor-equipas.firebaseapp.com",
  projectId: "leixoes-gestor-equipas",
  storageBucket: "leixoes-gestor-equipas.firebasestorage.app",
  messagingSenderId: "700428002666",
  appId: "1:700428002666:web:d5beb324579b3e4f387113",
  measurementId: "G-H4ZVMJR6K7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
