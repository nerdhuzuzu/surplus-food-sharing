// src/App.jsx
import React, { useState, useEffect } from "react";

import NewListingForm from "./components/NewListingForm";
import ListingCard from "./components/ListingCard";
import Dashboard from "./components/Dashboard";
import SignInButton from "./components/SignInButton";
import LiveLocationButton from "./components/LiveLocationButton";
import LiveMap from "./components/LiveMap";

import useLiveLocation from "./hooks/useLiveLocation";

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, DEMO_LISTINGS, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import { AnimatePresence, motion } from "framer-motion";
import { listItemVariants } from "./components/motionVariants";

export default function App() {
  const [listings, setListings] = useState([]);
  const [view, setView] = useState("feed");
  const [demoMode, setDemoMode] = useState(false);
  const [user, setUser] = useState(null);

  const { coords: userCoords, error: locationError, watching } = useLiveLocation();

  // Auth handling (firebase or demo)
  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser({
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
          });
        } else setUser(null);
      });
      return () => { if (typeof unsub === "function") unsub(); };
    }

    // demo fallback: read localStorage
    try {
      const raw = localStorage.getItem("surplus_demo_user");
      if (raw) {
        const demo = JSON.parse(raw);
        setUser({ displayName: demo.displayName, email: demo.email, photoURL: demo.photoURL || null });
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  // Listings (firestore or demo)
  useEffect(() => {
    if (!db) {
      setListings(DEMO_LISTINGS);
      setDemoMode(true);
      return;
    }

    const listingsCol = collection(db, "listings");
    const q = query(listingsCol, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setListings(data);
    }, err => {
      console.error("Firestore snapshot error:", err);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Surplus Food Sharing</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("feed")} className={`px-3 py-1 rounded ${view==='feed'? 'bg-amber-500 text-white':'bg-white shadow'}`}>Feed</button>
            <button onClick={() => setView("dashboard")} className={`px-3 py-1 rounded ${view==='dashboard'? 'bg-amber-500 text-white':'bg-white shadow'}`}>Dashboard</button>
          </div>

          <div className="flex items-center gap-3">
            <LiveLocationButton user={user} coords={userCoords} />
            <SignInButton user={user} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1">
          <NewListingForm demoMode={demoMode} setListings={setListings} userCoords={userCoords} />
          <div className="mt-4 text-sm text-gray-600 p-3 bg-white rounded shadow">Tip: Use WhatsApp share button on a listing to notify volunteers quickly.</div>

          {/* Live map and coords */}
          <div className="mt-4">
            <LiveMap coords={userCoords} />
          </div>

          <div className="mt-4 text-sm text-gray-700">
            {locationError && <div className="text-xs text-red-500">Location error: {locationError}</div>}
            {!locationError && <div className="text-xs text-gray-500">{userCoords ? `Watching GPS...` : 'Allow location to see live coords here.'}</div>}
          </div>
        </section>

        <section className="md:col-span-2">
          {view === 'feed' ? (
            <div className="space-y-4">
              {listings.length === 0 && <div className="p-6 text-center bg-white rounded shadow">No current listings - add one!</div>}

              <AnimatePresence>
                {listings.map(l => (
                  <motion.div key={l.id} layout initial="hidden" animate="visible" exit="exit" variants={listItemVariants}>
                    <ListingCard listing={l} setListings={setListings} db={db} userCoords={userCoords} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Dashboard listings={listings} />
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-xs text-gray-500">Built for Zero Hunger — Demo version. Replace Firebase config with your project details.</footer>
    </div>
  );
}
