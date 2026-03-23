import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Substitua estas credenciais pelas suas do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_AQUI_SUA_API_KEY",
  authDomain: "leixoes-gestor-equipas.firebaseapp.com",
  projectId: "leixoes-gestor-equipas",
  storageBucket: "leixoes-gestor-equipas.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
