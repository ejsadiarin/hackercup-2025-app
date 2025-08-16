"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import RouteMap to prevent SSR issues with Google Maps
const RouteMap = dynamic(() => import("@/features/map/component/RouteMap"), {
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  // Query state actually passed to the map
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");

  return (
    <div className="h-screen w-full p-4">
      <div className="mb-4 flex gap-4"></div>
      <RouteMap originQuery={originQuery} destinationQuery={destinationQuery} />
    </div>
  );
}
