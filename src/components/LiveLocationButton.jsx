// src/components/LiveLocationButton.jsx
import React, { useState } from "react";

export default function LiveLocationButton({ user, coords }) {
  const [sharing, setSharing] = useState(false);

  function handleToggle() {
    // Toggle UI-only state. Actual geolocation is controlled by the hook in App.
    setSharing(prev => !prev);
    // You can add logic here to send coords to Firestore when sharing is enabled.
    // Avoid alerts — use inline messages or small toast UI instead.
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 rounded ${sharing ? "bg-emerald-500 text-white" : "bg-white shadow"}`}
      title={sharing ? "Stop sharing my location" : "Share my location (starts watching GPS)"}
    >
      {sharing ? "Sharing" : "Share my location"}
    </button>
  );
}
