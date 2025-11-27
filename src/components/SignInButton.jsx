// src/components/SignInButton.jsx
import React, { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase";

/*
  Behavior:
  - If Firebase Auth (auth) is configured, uses signInWithPopup + Google provider.
  - If not configured (auth === null), creates a local "demo" signed-in user stored in localStorage
    so the UI behaves like a signed-in user during development/demo mode.
*/

const DEMO_KEY = "surplus_demo_user";

export default function SignInButton({ user }) {
  const [localUser, setLocalUser] = useState(null);

  // Keep local state in sync with Firebase user prop (if passed) or demo user
  useEffect(() => {
    // If Firebase auth exists, listen to auth state (extra safety)
    if (auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        setLocalUser(u ? { displayName: u.displayName, email: u.email, photoURL: u.photoURL } : null);
      });
      return () => unsub();
    }

    // else read demo user from localStorage
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) {
      try {
        setLocalUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(DEMO_KEY);
        setLocalUser(null);
      }
    } else {
      setLocalUser(null);
    }
  }, []);

  async function handleSignIn() {
    if (auth) {
      try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will update UI
      } catch (err) {
        console.error("Firebase sign-in failed:", err);
        alert("Sign-in failed: " + (err.message || err));
      }
      return;
    }

    // DEMO fallback: create a demo user and persist
    const name = prompt("Demo sign-in — enter a display name to use in the UI:", "Demo Volunteer");
    if (!name) return;
    const demo = { displayName: name, email: `${name.replace(/\s+/g,"").toLowerCase()}@demo.local`, photoURL: null, demo: true };
    localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
    setLocalUser(demo);
    alert("Signed in as demo user: " + name);
  }

  async function handleSignOut() {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase sign-out failed:", err);
      }
      return;
    }

    // demo sign-out
    localStorage.removeItem(DEMO_KEY);
    setLocalUser(null);
    alert("Signed out (demo)");
  }

  // Render
  if (localUser) {
    return (
      <div className="flex items-center gap-3 bg-white px-3 py-1 rounded shadow">
        {localUser.photoURL ? (
          <img src={localUser.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {(localUser.displayName || localUser.email || "U").charAt(0)}
          </div>
        )}
        <div className="text-sm">
          <div className="font-semibold leading-none">{localUser.displayName || localUser.email}</div>
          <div className="text-xs text-gray-500">{localUser.email}</div>
        </div>
        <button onClick={handleSignOut} className="px-3 py-1 rounded bg-white shadow ml-3">Sign out</button>
      </div>
    );
  }

  return (
    <button onClick={handleSignIn} className="px-3 py-1 rounded bg-white shadow">
      Sign in
    </button>
  );
}
