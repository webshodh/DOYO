import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  get as getRTDB,
  set,
  serverTimestamp,
  onValue,
  update,
  remove,
} from "firebase/database";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

// Set up dynamic env variables for dev/int/prod
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Databases: Realtime Database and Firestore (hybrid approach)
export const db = getDatabase(app); // Realtime Database
const firestore = getFirestore(app); // Firestore

// Storage
export const storage = getStorage(app);

// Realtime Database exports
export { ref, push, set, getRTDB, serverTimestamp, onValue, update, remove };

// Firestore exports
export {
  firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp,
  onSnapshot,
  query,
  where,
};

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
export {
  auth,
  googleProvider,
  signInWithPhoneNumber,
  signInWithPopup,
  OAuthProvider,
  firebaseConfig,
};
