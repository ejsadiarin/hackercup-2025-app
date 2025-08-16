"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("@/features/map/component/RouteMap"), {
  ssr: false,
});

export default function RouteExample() {
  const [origin, setOrigin] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [destination, setDestination] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Route Search Example</h2>
      <div className="mb-4 text-sm text-gray-600">
        Use the search box on the map to pick origin and destination. The
        selected top result will be used to generate the route.
      </div>

      <div className="h-[600px]">
        <RouteMap origin={origin} destination={destination} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Selected Origin</h3>
          <p className="text-sm text-gray-600 truncate">
            {originAddress || "None"}
          </p>
        </div>
        <div>
          <h3 className="font-medium">Selected Destination</h3>
          <p className="text-sm text-gray-600 truncate">
            {destinationAddress || "None"}
          </p>
        </div>
      </div>
    </div>
  );
}
