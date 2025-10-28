// ✅ src/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// -------------------------------
// 🔹 Firebase Config from .env
// -------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // for push notifications
};

// -------------------------------
// 🔹 Initialize Firebase
// -------------------------------
const app = initializeApp(firebaseConfig);

// -------------------------------
// 🔹 Core Services
// -------------------------------
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// -------------------------------
// 🔹 Messaging (Push Notifications)
// -------------------------------
let messaging;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("⚠️ Messaging not supported in this environment:", err);
}
export { messaging };

// -------------------------------
// 🔹 Auth Helpers
// -------------------------------
export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
    console.log("✅ Google sign-in successful");
  } catch (error) {
    console.error("❌ Google sign-in failed:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("👋 Signed out");
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
};

// -------------------------------
// 🔹 Initialize Firebase App
// -------------------------------
export function initFirebase() {
  console.log("✅ Firebase initialized");
  return { app, auth, db, messaging };
}

// -------------------------------
// 🔹 Push Notification Permissions
// -------------------------------
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn("⚠️ Messaging is not initialized.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
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

// -------------------------------
// 🔹 Foreground Messages
// -------------------------------
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log("📩 Message received:", payload);
  });
}

// Debug Firebase config
console.log("Firebase Config:", firebaseConfig);

export default initFirebase;
