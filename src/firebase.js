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
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "firebase/messaging";

// --- Firebase Config from .env ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);

// --- Core Services ---
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// --- Auth Helpers ---
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Signed in as:", result.user.displayName);
    return result.user;
  } catch (error) {
    console.error("❌ Sign-in error:", error);
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

// --- Optional: File Upload Helper ---
export const uploadFile = async (user, file) => {
  if (!user) throw new Error("User not signed in");
  const fileRef = ref(storage, `uploads/${user.uid}/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  console.log("📁 File uploaded:", url);
  return url;
};

// --- Push Notifications ---
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
      console.log("🔔 FCM Token:", token);
      return token;
    } else {
      console.warn("⚠️ Notification permission denied");
      return null;
    }
  } catch (err) {
    console.error("❌ Error requesting notification permission:", err);
  }
}

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log("📩 Foreground message received:", payload);
});

// --- Init Helper (optional) ---
export function initFirebase() {
  console.log("✅ Firebase initialized");
  return { app, auth, db, storage, messaging };
}

// --- Debug ---
console.log("Firebase Config:", firebaseConfig);

export default initFirebase;
