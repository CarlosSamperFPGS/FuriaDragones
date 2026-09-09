// src/lib/firebase.ts
// Instancia oficial y configuración de Firebase Firestore para Furia de Dragones

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDPy1LG-tdaH_8H-aQsnz4oT8l8nj-ilDE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "furiadragones.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "furiadragones",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "furiadragones.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1046356818741",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1046356818741:web:70bf459c700624ccac6a7c",
  measurementId: "G-NF18P320W9",
};

// Inicialización segura para Next.js (SSR / Cliente)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
