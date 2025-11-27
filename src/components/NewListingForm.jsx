// src/components/NewListingForm.jsx
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, serverTimestamp } from "../firebase";

export default function NewListingForm({ demoMode = false, setListings = () => {}, userCoords = null }) {
  const [name, setName] = useState("");
  const [items, setItems] = useState("");
  const [quantity, setQuantity] = useState("");
  const [locationText, setLocationText] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [useCoords, setUseCoords] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !items) return alert("Please fill name and items");
    setLoading(true);
    try {
      const payload = {
        name, items, quantity, location: locationText, pickupTime,
        status: "available", claimedBy: null,
        createdAt: serverTimestamp ? serverTimestamp() : Date.now(),
      };
      if (useCoords && userCoords) payload.coords = userCoords; // attach coords from hook

      if (demoMode || !db) {
        const newItem = { id: Date.now().toString(), ...payload, createdAt: Date.now() };
        setListings(prev => [newItem, ...prev]);
      } else {
        await addDoc(collection(db, "listings"), payload);
      }

      setName(""); setItems(""); setQuantity(""); setLocationText(""); setPickupTime(""); setUseCoords(false);
    } catch (err) {
      console.error(err);
      alert("Error adding listing");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-3">
      <h2 className="font-semibold">Add Food Listing (placeholder)</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Restaurant / Hostel name" className="w-full p-2 border rounded" />
      <input value={items} onChange={e=>setItems(e.target.value)} placeholder="Items (eg: 20 chapatis, 10kg rice)" className="w-full p-2 border rounded" />
      <input value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="Approx quantity" className="w-full p-2 border rounded" />
      <input value={locationText} onChange={e=>setLocationText(e.target.value)} placeholder="Pickup location / address" className="w-full p-2 border rounded" />
      <input value={pickupTime} onChange={e=>setPickupTime(e.target.value)} placeholder="Pickup time (e.g., 6:30 PM)" className="w-full p-2 border rounded" />

      <div className="flex items-center gap-2">
        <label className="text-sm">
          <input type="checkbox" checked={useCoords} onChange={e=>setUseCoords(e.target.checked)} className="mr-2" />
          Use my current location
        </label>
        {useCoords && !userCoords && <span className="text-xs text-gray-500"> (allow location to attach coords)</span>}
      </div>

      <button type="submit" disabled={loading} className="w-full py-2 rounded bg-amber-500 text-white">{loading? 'Adding...':'Add Listing'}</button>
    </form>
  );
}
