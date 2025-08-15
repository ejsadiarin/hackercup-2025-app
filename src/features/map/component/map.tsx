"use client";
import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  origin?: google.maps.LatLngLiteral;
  destination?: google.maps.LatLngLiteral;
  waypoints?: google.maps.DirectionsWaypoint[];
  showRoute?: boolean;
  markers?: Array<{
    id: string;
    position: google.maps.LatLngLiteral;
    title?: string;
    icon?: string;
  }>;
}

const MapComponent = ({
  center,
  zoom,
  origin,
  destination,
  waypoints = [],
  showRoute = false,
  markers = [],
}: MapComponentProps) => {
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const mapStyles = {
    width: "384px",
    height: "524px",
  };

  const mapCenter = {
    lat: center[0],
    lng: center[1],
  };

  // Check if Google Maps API key is available
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || "",
    libraries: ["places", "geometry"], // Add libraries for enhanced functionality
  });

  // Calculate and display route
  const calculateRoute = useCallback(async () => {
    if (!isLoaded || !origin || !destination) return;

    setIsCalculatingRoute(true);
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true, // Optimize waypoint order
        travelMode: google.maps.TravelMode.DRIVING, // Can be changed to WALKING, TRANSIT, etc.
        avoidHighways: false,
        avoidTolls: false,
      });

      setDirectionsResponse(result);
    } catch (error) {
      console.error("Error calculating route:", error);
      setDirectionsResponse(null);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [isLoaded, origin, destination, waypoints]);

  // Calculate route when props change
  useEffect(() => {
    if (showRoute && origin && destination) {
      calculateRoute();
    } else {
      setDirectionsResponse(null);
    }
  }, [showRoute, origin, destination, waypoints, calculateRoute]);

  if (!googleMapsApiKey) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
        style={mapStyles}
      >
        <div className="text-center">
          <p className="text-gray-600 font-medium">Map Component</p>
          <p className="text-sm text-gray-500 mt-2">
            Google Maps API key not configured
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
        style={mapStyles}
      >
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
        style={mapStyles}
      >
        <div className="text-center">
          <p className="text-gray-600 font-medium">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={mapStyles} center={mapCenter} zoom={zoom}>
      {/* Custom markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          icon={marker.icon}
        />
      ))}

      {/* Route display */}
      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: false, // Show start/end markers
            polylineOptions: {
              strokeColor: "#4285F4", // Google Blue
              strokeWeight: 6,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {/* Loading indicator for route calculation */}
      {isCalculatingRoute && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          <p className="text-sm text-gray-600">Calculating route...</p>
        </div>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
