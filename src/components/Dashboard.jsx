// src/components/Dashboard.jsx
import React from "react";

export default function Dashboard({ listings = [] }) {
  const total = listings.length;
  const available = listings.filter((l) => l.status === "available").length;
  const claimed = listings.filter((l) => l.status === "claimed").length;
  const completed = listings.filter((l) => l.status === "completed").length;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-semibold mb-2">Dashboard</h2>
      <div className="text-sm text-gray-700">Total listings: {total}</div>
      <div className="text-sm text-gray-700">Available: {available}</div>
      <div className="text-sm text-gray-700">Claimed: {claimed}</div>
      <div className="text-sm text-gray-700">Completed: {completed}</div>
    </div>
  );
}
