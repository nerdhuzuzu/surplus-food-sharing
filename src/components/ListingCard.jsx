// src/components/ListingCard.jsx
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db as firebaseDb } from "../firebase";
import MapPreview from "./MapPreview";

export default function ListingCard({ listing, setListings, db = firebaseDb, userCoords = null }) {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(listing.status || "available");

  useEffect(() => {
    setLocalStatus(listing.status || "available");
  }, [listing.status]);

  async function claim() {
    const name = prompt("Enter your name to claim this listing (volunteer/NGO)");
    if (!name) return;
    setLoading(true);
    try {
      if (!db) {
        setListings(prev => prev.map(p => p.id === listing.id ? { ...p, claimedBy: name, status: 'claimed' } : p));
        setLocalStatus("claimed");
      } else {
        const ref = doc(db, "listings", listing.id);
        await updateDoc(ref, { claimedBy: name, status: 'claimed' });
        setLocalStatus("claimed");
      }
    } catch (err) {
      console.error(err); alert("Failed to claim");
    }
    setLoading(false);
  }

  async function markPicked() {
    if (!confirm('Mark this listing as picked up / completed?')) return;
    setLoading(true);
    try {
      if (!db) {
        setListings(prev => prev.map(p => p.id === listing.id ? { ...p, status: 'completed' } : p));
        setLocalStatus("completed");
      } else {
        const ref = doc(db, "listings", listing.id);
        await updateDoc(ref, { status: 'completed' });
        setLocalStatus("completed");
      }
    } catch (err) {
      console.error(err); alert('Failed to update');
    }
    setLoading(false);
  }

  function shareWhatsApp() {
    const text = `Food available from ${listing.name}: ${listing.items}. Pickup: ${listing.pickupTime || 'ASAP'}. Location: ${listing.location || 'Not provided'}. Please claim if you can help.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  const statusKey = localStatus || "available";
  const strike = statusKey === "completed";

  return (
    <div className="p-4 bg-white rounded shadow flex flex-col md:flex-row justify-between items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${strike ? 'line-through text-gray-400':''}`}>{listing.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{statusKey}</span>
        </div>

        <p className={`mt-1 ${strike ? 'text-gray-400':''}`}>{listing.items} • {listing.quantity}</p>
        <p className="text-sm text-gray-500 mt-2">Pickup: {listing.pickupTime || 'ASAP'}</p>
        <p className="text-sm text-gray-500">Location: {listing.location || '-'}</p>
        {listing.claimedBy && <p className="text-sm text-green-700 mt-1">Claimed by: {listing.claimedBy}</p>}

        {/* Map preview if coords available */}
        {listing.coords && (
          <div className="mt-3">
            <MapPreview center={listing.coords} userCoords={userCoords} height="180px" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-0 md:ml-4">
        {statusKey === 'available' && <button onClick={claim} disabled={loading} className="px-3 py-1 rounded bg-emerald-500 text-white">{loading ? '...' : 'Claim'}</button>}
        {statusKey === 'claimed' && <button onClick={markPicked} disabled={loading} className="px-3 py-1 rounded bg-blue-600 text-white">{loading ? '...':'Mark Picked'}</button>}
        <button onClick={shareWhatsApp} className="px-3 py-1 rounded bg-slate-200">Share</button>
      </div>
    </div>
  );
}
