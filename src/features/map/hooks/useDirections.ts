"use client";

import { useState, useEffect, useCallback } from "react";

export interface UseDirectionsOptions {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  travelMode?: google.maps.TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  enabled?: boolean;
}

export interface UseDirectionsResult {
  directionsResult: google.maps.DirectionsResult | null;
  isLoading: boolean;
  error: string | null;
  distance: string;
  duration: string;
  refetch: () => void;
}

export function useDirections(
  options: UseDirectionsOptions
): UseDirectionsResult {
  const [directionsResult, setDirectionsResult] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    origin,
    destination,
    travelMode,
    avoidTolls = false,
    avoidHighways = false,
    enabled = true,
  } = options;

  const fetchDirections = useCallback(async () => {
    if (!origin || !destination || !enabled || typeof google === "undefined")
      return;

    setIsLoading(true);
    setError(null);

    try {
      console.debug("useDirections.fetchDirections", {
        origin,
        destination,
        travelMode,
      });
      const directionsService = new google.maps.DirectionsService();

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: travelMode || google.maps.TravelMode.DRIVING,
        avoidTolls,
        avoidHighways,
        optimizeWaypoints: true,
      };

      const result = await new Promise<google.maps.DirectionsResult>(
        (resolve, reject) => {
          directionsService.route(request, (result, status) => {
            console.debug("DirectionsService.route callback", {
              status,
              result,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((status as any) === google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          });
        }
      );

      setDirectionsResult(result);
    } catch (err) {
      console.error("useDirections error", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch directions"
      );
      setDirectionsResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, travelMode, avoidTolls, avoidHighways, enabled]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  // Derived values
  const distance = directionsResult?.routes[0]?.legs[0]?.distance?.text || "";
  const duration = directionsResult?.routes[0]?.legs[0]?.duration?.text || "";

  return {
    directionsResult,
    isLoading,
    error,
    distance,
    duration,
    refetch: fetchDirections,
  };
}
