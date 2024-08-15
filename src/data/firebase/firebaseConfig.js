import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set, serverTimestamp, onValue, update, remove} from "firebase/database";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyCO8cKH_pomhLcbT1sO2H4QWoD4Z6GrxAE",
  authDomain: "menu-app-1332d.firebaseapp.com",
  databaseURL: "https://menu-app-1332d-default-rtdb.firebaseio.com",
  projectId: "menu-app-1332d",
  storageBucket: "menu-app-1332d.appspot.com",
  messagingSenderId: "247653223701",
  appId: "1:247653223701:web:016dca75d85db9f7182d1c",
  measurementId: "G-ZYJWWYWD65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export {ref, push, set, serverTimestamp, onValue, update, remove};
// Get a reference to the auth service
export const auth = getAuth(app);


