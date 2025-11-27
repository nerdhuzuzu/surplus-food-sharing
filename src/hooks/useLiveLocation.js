// src/hooks/useLiveLocation.js
import { useEffect, useState, useRef } from "react";

export default function useLiveLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setError(null);
        setWatching(true);
      },
      (err) => {
        setError(err.message || "Failed to get location");
        setWatching(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const stop = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatching(false);
    }
  };

  return { coords, error, watching, stop };
}
