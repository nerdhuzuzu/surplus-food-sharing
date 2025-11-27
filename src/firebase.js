// src/firebase.js
// Modular Firebase (v9+) — ESM
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, serverTimestamp as _serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/*
  Replace the config below with your Firebase project's config.
  You already provided one; I'm using it here.
*/
const firebaseConfig = {
  apiKey: "AIzaSyCjplfKZNAnO2gbsyatUcLErSxi4JjebVc",
  authDomain: "surplus-food-1f09e.firebaseapp.com",
  projectId: "surplus-food-1f09e",
  storageBucket: "surplus-food-1f09e.firebasestorage.app",
  messagingSenderId: "1032087518298",
  appId: "1:1032087518298:web:db9daca1ed6e4ee984ec63",
  measurementId: "G-3T1M8GLEMX",
};

export const DEMO_LISTINGS = [
  {
    id: "demo-1",
    name: "Fresh bread & fruit",
    items: "10 loaves, assorted fruit • 10+ servings",
    quantity: "10+",
    location: "Community Center",
    status: "available",
    createdAt: Date.now(),
  },
  {
    id: "demo-2",
    name: "Rice & Veg",
    items: "Meals • 4-5 servings",
    quantity: "4-5",
    location: "Local temple",
    status: "available",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
];

export let db = null;
export let auth = null;
export let provider = null;
export const serverTimestamp = _serverTimestamp; // re-export for use in forms

try {
  // Basic sanity check — require projectId + apiKey to attempt init
  const hasConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId;

  if (hasConfig) {
    // initialize only once
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

    // get Firestore + Auth
    try {
      db = getFirestore(app);
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
      console.log("Firebase initialized — Firestore and Auth available.");
    } catch (innerErr) {
      console.warn("Firebase services failed to initialize:", innerErr);
      db = null;
      auth = null;
      provider = null;
    }
  } else {
    console.warn("Firebase config missing or incomplete — running in demo mode.");
  }
} catch (err) {
  console.warn("Firebase initialization error — demo mode.", err);
  db = null;
  auth = null;
  provider = null;
}
