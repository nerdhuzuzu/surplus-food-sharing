// src/components/MapPreview.jsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix default icon paths for Leaflet (works with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// helper to update map view when center changes
function MapAutoCenter({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    try { map.setView([center[0], center[1]], zoom, { animate: true }); } catch (e) { /* ignore */ }
  }, [center, zoom, map]);
  return null;
}

// helper to invalidate map size after it mounts (fixes clipped map)
function MapInvalidate() {
  const map = useMap();
  useEffect(() => {
    // call twice: once immediately, once after a short delay to be safe
    setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 50);
    try { map.invalidateSize(); } catch (e) {}
  }, [map]);
  return null;
}

/*
  Props:
    - center: [lat, lng] for the listing (optional)
    - userCoords: [lat, lng] of the current user (optional)
    - height: CSS height string (optional, default "180px")
*/
export default function MapPreview({ center, userCoords, height = "180px" }) {
  // fallback center (if no coords available)
  const fallback = center || userCoords || [18.5204, 73.8567]; // Pune-ish fallback
  const zoom = center ? 14 : 12;
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <MapContainer
        center={fallback}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        whenCreated={(map) => {
          // ensure the map redraws correctly when created
          setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 60);
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidate />
        <MapAutoCenter center={center || userCoords} zoom={zoom} />

        {/* listing marker */}
        {center && (
          <Marker position={center}>
            <Popup>Listing location</Popup>
          </Marker>
        )}

        {/* user marker (blue circle + simple Marker) */}
        {userCoords && (
          <>
            <Marker position={userCoords}>
              <Popup>Your location</Popup>
            </Marker>
            <Circle center={userCoords} radius={40} pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.12 }} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
