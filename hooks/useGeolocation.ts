"use client";

import { useState, useCallback, useRef } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  enabled: boolean;
}

/**
 * Hook for managing geolocation state.
 * Caches coordinates for the session to avoid re-prompting.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    enabled: false,
  });

  const cached = useRef<{ lat: number; lng: number } | null>(null);

  const requestLocation = useCallback(() => {
    if (cached.current) {
      setState({
        latitude: cached.current.lat,
        longitude: cached.current.lng,
        loading: false,
        error: null,
        enabled: true,
      });
      return;
    }

    if (!("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, error: "Geolocation not supported", loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        cached.current = { lat: latitude, lng: longitude };
        setState({
          latitude,
          longitude,
          loading: false,
          error: null,
          enabled: true,
        });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.code === 1 ? "Location access denied" : "Unable to get location",
          enabled: false,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const disable = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      loading: false,
      error: null,
      enabled: false,
    });
  }, []);

  return { ...state, requestLocation, disable };
}
