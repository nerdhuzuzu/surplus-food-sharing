// src/components/LiveMap.jsx
import React from "react";
import MapPreview from "./MapPreview";

export default function LiveMap({ coords, height = "220px" }) {
  return (
    <div className="mt-4 bg-white rounded shadow p-3">
      <div className="font-semibold mb-2">Your location</div>
      {coords ? (
        <>
          <div className="text-sm text-gray-700 mb-2">Live coords: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>
          <MapPreview center={undefined} userCoords={coords} height={height} />
        </>
      ) : (
        <div className="text-sm text-gray-500">Location not available. Allow location permissions to show map.</div>
      )}
    </div>
  );
}
