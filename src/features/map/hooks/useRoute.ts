"use client";

import { useState, useEffect } from "react";
import { getRoutesAPI, RouteRequest, RouteResponse } from "@/utils/routes-api";

export interface UseRouteOptions {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  travelMode?: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT" | "TWO_WHEELER";
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  enabled?: boolean; // Only fetch when true
}

export interface UseRouteResult {
  route: RouteResponse | null;
  isLoading: boolean;
  error: string | null;
  polylinePoints: Array<{ lat: number; lng: number }>;
  distance: string;
  duration: string;
  refetch: () => void;
}

export function useRoute(options: UseRouteOptions): UseRouteResult {
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    origin,
    destination,
    travelMode = "DRIVE",
    avoidTolls = false,
    avoidHighways = false,
    enabled = true,
  } = options;

  const fetchRoute = async () => {
    if (!origin || !destination || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const routesAPI = getRoutesAPI();
      const result = await routesAPI.getRoute(origin, destination, {
        travelMode,
        avoidTolls,
        avoidHighways,
        routingPreference: "TRAFFIC_AWARE",
      });

      setRoute(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch route");
      setRoute(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [
    origin?.lat,
    origin?.lng,
    destination?.lat,
    destination?.lng,
    travelMode,
    avoidTolls,
    avoidHighways,
    enabled,
  ]);

  // Derived values
  const polylinePoints = route?.routes[0]?.polyline?.encodedPolyline
    ? getRoutesAPI().decodePolyline(route.routes[0].polyline.encodedPolyline)
    : [];

  const distance = route?.routes[0]?.distanceMeters
    ? `${(route.routes[0].distanceMeters / 1000).toFixed(1)} km`
    : "";

  const duration = route?.routes[0]?.duration
    ? formatDuration(route.routes[0].duration)
    : "";

  return {
    route,
    isLoading,
    error,
    polylinePoints,
    distance,
    duration,
    refetch: fetchRoute,
  };
}

function formatDuration(duration: string): string {
  // Duration comes as "123s" format, convert to human readable
  const seconds = parseInt(duration.replace("s", ""));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
