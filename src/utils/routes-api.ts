/**
 * Google Routes API utilities
 * https://developers.google.com/maps/documentation/routes
 */

export interface RouteWaypoint {
  location: {
    latLng?: {
      latitude: number;
      longitude: number;
    };
    placeId?: string;
    address?: string;
  };
  via?: boolean; // If true, treats as intermediate waypoint
}

export interface RouteRequest {
  origin: RouteWaypoint;
  destination: RouteWaypoint;
  intermediates?: RouteWaypoint[];
  travelMode?: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT" | "TWO_WHEELER";
  routingPreference?:
    | "TRAFFIC_UNAWARE"
    | "TRAFFIC_AWARE"
    | "TRAFFIC_AWARE_OPTIMAL";
  computeAlternativeRoutes?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  avoidIndoor?: boolean;
  departureTime?: string; // ISO 8601 format
  languageCode?: string;
  units?: "IMPERIAL" | "METRIC";
}

export interface RouteResponse {
  routes: Array<{
    legs: Array<{
      distanceMeters: number;
      duration: string;
      staticDuration: string;
      polyline: {
        encodedPolyline: string;
      };
      startLocation: {
        latLng: {
          latitude: number;
          longitude: number;
        };
      };
      endLocation: {
        latLng: {
          latitude: number;
          longitude: number;
        };
      };
      steps: Array<{
        distanceMeters: number;
        staticDuration: string;
        polyline: {
          encodedPolyline: string;
        };
        startLocation: {
          latLng: {
            latitude: number;
            longitude: number;
          };
        };
        endLocation: {
          latLng: {
            latitude: number;
            longitude: number;
          };
        };
        navigationInstruction: {
          maneuver: string;
          instructions: string;
        };
      }>;
    }>;
    distanceMeters: number;
    duration: string;
    staticDuration: string;
    polyline: {
      encodedPolyline: string;
    };
    description: string;
    warnings: string[];
  }>;
}

export class RoutesAPI {
  private apiKey: string;
  private baseUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async computeRoute(request: RouteRequest): Promise<RouteResponse> {
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": this.apiKey,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    };

    console.log(
      "Sending request to Routes API:",
      JSON.stringify(request, null, 2)
    );

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Routes API error response:", errorText);
      throw new Error(
        `Routes API error: ${response.status} ${response.statusText}. Details: ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Simple helper to get route between two coordinates
   */
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options: Partial<RouteRequest> = {}
  ): Promise<RouteResponse> {
    // Clean request with minimal required fields
    const request: RouteRequest = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: options.travelMode || "DRIVE",
      routingPreference: options.routingPreference || "TRAFFIC_UNAWARE",
      ...options,
    };

    // Remove undefined/null values that might cause 400 errors
    const cleanRequest = JSON.parse(JSON.stringify(request));

    return this.computeRoute(cleanRequest);
  }

  /**
   * Helper to decode polyline (you might want to use a library like @googlemaps/polyline-codec)
   */
  decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
    // Simple polyline decoder - consider using @googlemaps/polyline-codec for production
    const points: Array<{ lat: number; lng: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return points;
  }
}

// Singleton instance
let routesAPI: RoutesAPI | null = null;

export function getRoutesAPI(): RoutesAPI {
  if (!routesAPI) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Google Maps API key not found. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment."
      );
    }
    routesAPI = new RoutesAPI(apiKey);
  }
  return routesAPI;
}
