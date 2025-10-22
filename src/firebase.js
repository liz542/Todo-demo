// src/firebase.js

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "firebase/messaging";

// --- Firebase configuration from environment variables ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);

// --- Core Firebase services ---
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// --- Authentication helpers ---
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logOut = () => signOut(auth);

// --- Firebase initialization wrapper ---
export function initFirebase() {
  console.log("✅ Firebase initialized");
  return { app, auth, db, messaging };
}

// --- Request notification permission and handle tokens ---
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      console.log("🔔 Push token:", token);
      return token;
    } else {
      console.warn("⚠️ Notification permission not granted");
      return null;
    }
  } catch (err) {
    console.error("❌ Error requesting notification permission:", err);
  }
}

// --- Foreground message handler ---
onMessage(messaging, (payload) => {
  console.log("📩 Message received while app in foreground:", payload);
});

// Debugging: check that Firebase config loaded
console.log("Firebase Config:", firebaseConfig);
