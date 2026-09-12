// src/lib/firebase.ts
// Instancia oficial y configuración de Firebase Firestore para Furia de Dragones
// Sin credenciales hardcodeadas en código fuente

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[Firebase] Variable de entorno requerida no definida: ${name}. ` +
      `Configura esta variable en tu archivo .env.local o en el panel de Vercel.`
    );
  }
  return value;
}

export const firebaseConfig = {
  apiKey: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicialización segura para Next.js (SSR / Cliente)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
