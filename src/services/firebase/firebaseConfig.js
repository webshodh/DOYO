// services/firebase/firebaseConfig.js

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
  ref as rtdbRef,
  push,
  get as getRTDB,
  set as rtdbSet,
  serverTimestamp as rtdbServerTimestamp,
  onValue,
  update as rtdbUpdate,
  remove as rtdbRemove,
} from "firebase/database";
import {
  getFirestore,
  doc as fsDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection as fsCollection,
  addDoc,
  getDocs,
  Timestamp,
  onSnapshot,
  query as fsQuery,
  where as fsWhere,
} from "firebase/firestore";

// Dynamic environment vars
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

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Firestore instance → use for `collection()`, `doc()`, etc.
export const db = getFirestore(app);

// Realtime Database instance → use for `ref()`, `getRTDB()`, etc.
export const rtdb = getDatabase(app);

// Storage
export const storage = getStorage(app);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPhoneNumber, signInWithPopup, OAuthProvider };

// Firestore exports
export {
  fsDoc as doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  fsCollection as collection,
  addDoc,
  getDocs,
  Timestamp,
  onSnapshot,
  fsQuery as query,
  fsWhere as where,
};

// Realtime Database exports
export {
  rtdbRef as ref,
  push,
  getRTDB as get,
  rtdbSet as set,
  rtdbServerTimestamp as serverTimestamp,
  onValue,
  rtdbUpdate as update,
  rtdbRemove as remove,
};

// Config
export { firebaseConfig };
