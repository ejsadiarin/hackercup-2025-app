"use client";

import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useDirections } from "../hooks/useDirections";
import { FiSearch } from "react-icons/fi";
import { FaLocationPin } from "react-icons/fa6";
import { HiOutlineDotsVertical } from "react-icons/hi";

interface LocationSearchResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: { lat: number; lng: number };
  };
}

interface RouteMapProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  originQuery?: string;
  destinationQuery?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  travelMode?: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";
  showTraffic?: boolean;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onOriginChange?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  onDestinationChange?: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

export default function RouteMap({
  origin,
  destination,
  originQuery,
  destinationQuery,
  center = { lat: 14.5995, lng: 120.9842 }, // Manila default
  zoom = 13,
  travelMode = "DRIVING",
  showTraffic = false,
  markers = [],
  onMapClick,
  onOriginChange,
  onDestinationChange,
}: RouteMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Internal origin/destination state (sync with props)
  const [localOrigin, setLocalOrigin] = useState<
    { lat: number; lng: number } | undefined
  >(origin);
  const [localDestination, setLocalDestination] = useState<
    { lat: number; lng: number } | undefined
  >(destination);

  // Keep local state in sync if parent updates props
  useEffect(() => {
    setLocalOrigin(origin);
  }, [origin]);

  useEffect(() => {
    setLocalDestination(destination);
  }, [destination]);

  // Search states
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [originResults, setOriginResults] = useState<LocationSearchResult[]>(
    []
  );
  const [destinationResults, setDestinationResults] = useState<
    LocationSearchResult[]
  >([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  // Search input refs
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  });

  // Search for places using Google Places API
  const searchPlaces = async (
    query: string
  ): Promise<LocationSearchResult[]> => {
    if (!query || !isLoaded || !google) return [];

    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    return new Promise((resolve) => {
      const request = {
        query,
        fields: ["place_id", "formatted_address", "name", "geometry"],
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const searchResults: LocationSearchResult[] = results
            .slice(0, 5)
            .map((place) => ({
              place_id: place.place_id || "",
              formatted_address: place.formatted_address || "",
              name: place.name || "",
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
              },
            }));
          resolve(searchResults);
        } else {
          resolve([]);
        }
      });
    });
  };

  // Handle origin search
  const handleOriginSearch = async (query: string) => {
    setOriginSearch(query);
    if (query.length > 2) {
      const results = await searchPlaces(query);
      setOriginResults(results);
      setShowOriginResults(true);
    } else {
      setOriginResults([]);
      setShowOriginResults(false);
    }
  };

  // Handle destination search
  const handleDestinationSearch = async (query: string) => {
    setDestinationSearch(query);
    if (query.length > 2) {
      const results = await searchPlaces(query);
      setDestinationResults(results);
      setShowDestinationResults(true);
    } else {
      setDestinationResults([]);
      setShowDestinationResults(false);
    }
  };

  // Select origin location
  const selectOrigin = (location: LocationSearchResult) => {
    const coords = {
      lat: location.geometry.location.lat,
      lng: location.geometry.location.lng,
    };
    setOriginAddress(location.formatted_address);
    setOriginSearch(location.name);
    setShowOriginResults(false);
    setLocalOrigin(coords);
    onOriginChange?.({
      lat: coords.lat,
      lng: coords.lng,
      address: location.formatted_address,
    });
  };

  // Select destination location
  const selectDestination = (location: LocationSearchResult) => {
    const coords = {
      lat: location.geometry.location.lat,
      lng: location.geometry.location.lng,
    };
    setDestinationAddress(location.formatted_address);
    setDestinationSearch(location.name);
    setShowDestinationResults(false);
    setLocalDestination(coords);
    onDestinationChange?.({
      lat: coords.lat,
      lng: coords.lng,
      address: location.formatted_address,
    });
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        originInputRef.current &&
        !originInputRef.current.contains(event.target as Node)
      ) {
        setShowOriginResults(false);
      }
      if (
        destinationInputRef.current &&
        !destinationInputRef.current.contains(event.target as Node)
      ) {
        setShowDestinationResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch route using our custom hook
  const {
    directionsResult,
    isLoading: routeLoading,
    error: routeError,
    distance,
    duration,
    refetch, // Get refetch function
  } = useDirections({
    origin: localOrigin,
    destination: localDestination,
    travelMode:
      isLoaded && google?.maps ? google.maps.TravelMode[travelMode] : undefined,
    enabled: !!(localOrigin && localDestination && isLoaded),
  });

  // Trigger route calculation when both local origin and destination are set
  useEffect(() => {
    if (localOrigin && localDestination && isLoaded) {
      // refetch is provided by the useDirections hook
      try {
        refetch();
      } catch (e) {
        // ignore
      }
    }
  }, [localOrigin, localDestination, isLoaded, refetch]);

  const mapStyles = {
    width: "384px",
    height: "524px",
  };

  const [showSearch, setShowSearch] = useState(false);

  // Auto-fit bounds when route is loaded
  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    if (localOrigin && localDestination) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(localOrigin);
      bounds.extend(localDestination);
      mapInstance.fitBounds(bounds);
    }
  };

  // Automatically search and select top result if query is provided
  useEffect(() => {
    const searchAndSelect = async (
      query: string | undefined,
      selector: (location: LocationSearchResult) => void
    ) => {
      if (query && isLoaded) {
        const results = await searchPlaces(query);
        if (results.length > 0) {
          selector(results[0]);
        }
      }
    };

    searchAndSelect(originQuery, selectOrigin);
    searchAndSelect(destinationQuery, selectDestination);
  }, [originQuery, destinationQuery, isLoaded]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
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
    <div className="relative flex justify-center items-center flex-col">
      {/* Search Interface */}
      {showSearch && (
        <div className="absolute top-4 right-4 z-20 bg-white p-4 rounded-lg shadow-lg w-80 space-y-4">
          {/* Origin Search */}
          <div className="relative" ref={originInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              type="text"
              value={originSearch}
              onChange={(e) => handleOriginSearch(e.target.value)}
              placeholder="Search for starting location..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showOriginResults && originResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-30">
                {originResults.map((result) => (
                  <div
                    key={result.place_id}
                    onClick={() => selectOrigin(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {result.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.formatted_address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="relative" ref={destinationInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => handleDestinationSearch(e.target.value)}
              placeholder="Search for destination..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showDestinationResults && destinationResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-30">
                {destinationResults.map((result) => (
                  <div
                    key={result.place_id}
                    onClick={() => selectDestination(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {result.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.formatted_address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Addresses Display */}
          {originAddress && (
            <div className="text-xs">
              <span className="font-medium text-green-600">From:</span>
              <div className="text-gray-600 truncate">{originAddress}</div>
            </div>
          )}
          {destinationAddress && (
            <div className="text-xs">
              <span className="font-medium text-red-600">To:</span>
              <div className="text-gray-600 truncate">{destinationAddress}</div>
            </div>
          )}
        </div>
      )}

      {/* Route Info Panel */}
      {(routeLoading || directionsResult || routeError) && (
        <div className="absolute -bottom-20 left-20 z-10 bg-white p-3 rounded-lg shadow-md min-w-[200px]">
          {routeLoading && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">
                Calculating route...
              </span>
            </div>
          )}

          {directionsResult && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Route Information
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{distance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize">
                    {google.maps.TravelMode[travelMode]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {routeError && (
            <div className="text-red-600 text-sm">
              <p className="font-medium">Route Error</p>
              <p>{routeError}</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Locations Card */}
      <div className=" bg-gray-100 p-4 rounded-lg shadow-lg w-96">
        <div className="text-sm space-y-1">
          <div
            onClick={() => setShowSearch(!showSearch)}
            className=" flex justify-between hover:cursor-pointer"
          >
            <span className="font-medium flex items-center gap-1">
              <FaLocationPin />
              Origin:{"   "}
            </span>
            <span className="truncate ">{originAddress || "Not selected"}</span>
          </div>
          <HiOutlineDotsVertical />
          <div
            onClick={() => setShowSearch(!showSearch)}
            className="flex justify-between hover:cursor-pointer"
          >
            <span className="font-medium text-[#8A009B] flex items-center gap-1">
              <FaLocationPin /> Destination:{" "}
            </span>
            <span className="text-gray-700 truncate">
              {" "}
              {destinationAddress || "Not selected"}
            </span>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapStyles}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        onClick={onMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Origin Marker */}
        {localOrigin && (
          <Marker
            position={localOrigin}
            title="Origin"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}

        {/* Destination Marker */}
        {localDestination && (
          <Marker
            position={localDestination}
            title="Destination"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}

        {/* Custom Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={marker.icon}
            onClick={() => {
              setSelectedMarker(marker.id);
              marker.onClick?.();
            }}
          >
            {selectedMarker === marker.id && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div>
                  <h3 className="font-medium">{marker.title}</h3>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Route Directions Renderer */}
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              suppressMarkers: false, // Show start/end markers
              polylineOptions: {
                strokeColor: "#800080", // Purple
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}

        {/* Traffic Layer */}
        {showTraffic && map && (
          <div
            ref={() => {
              const trafficLayer = new google.maps.TrafficLayer();
              trafficLayer.setMap(map);
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

function getTravelModeColor(
  mode: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT"
): string {
  switch (mode) {
    case "DRIVING":
      return "#4285F4"; // Blue
    case "WALKING":
      return "#34A853"; // Green
    case "BICYCLING":
      return "#FBBC04"; // Yellow
    case "TRANSIT":
      return "#EA4335"; // Red
    default:
      return "#4285F4";
  }
}
