console.log("Firebase API Key:", import.meta.env.VITE_FIREBASE_API_KEY);
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const storage = getStorage(app);
export { ref, uploadBytes, getDownloadURL };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Core services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// Auth helpers
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logOut = () => signOut(auth);

// Initialize Firebase for app
export function initFirebase() {
  console.log("✅ Firebase initialized");
  return { app, auth, db, messaging };
}

// Notification token request
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
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

// Foreground messages
onMessage(messaging, (payload) => {
  console.log("📩 Message received:", payload);
});

// Debug Firebase config
console.log("Firebase Config:", firebaseConfig);

export default initFirebase;

