"use client";

import { useState, useCallback, useRef } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  enabled: boolean;
  /** True when the user has not yet granted location consent via the modal */
  needsConsent: boolean;
}

function hasLocationConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("ht-location-consent") === "true";
}

/**
 * Hook for managing geolocation state.
 * Caches coordinates for the session to avoid re-prompting.
 * Requires location consent (ht-location-consent in localStorage)
 * before calling the browser geolocation API.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    enabled: false,
    needsConsent: !hasLocationConsent(),
  });

  const cached = useRef<{ lat: number; lng: number } | null>(null);

  const fetchPosition = useCallback(() => {
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
          needsConsent: false,
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

  const requestLocation = useCallback(() => {
    if (cached.current) {
      setState({
        latitude: cached.current.lat,
        longitude: cached.current.lng,
        loading: false,
        error: null,
        enabled: true,
        needsConsent: false,
      });
      return;
    }

    // Check consent before calling browser API
    if (!hasLocationConsent()) {
      setState((prev) => ({ ...prev, needsConsent: true }));
      return;
    }

    fetchPosition();
  }, [fetchPosition]);

  /**
   * Called after the user grants consent via LocationConsentModal.
   * Sets localStorage and immediately requests the browser position.
   */
  const grantConsent = useCallback(() => {
    localStorage.setItem("ht-location-consent", "true");
    setState((prev) => ({ ...prev, needsConsent: false }));
    fetchPosition();
  }, [fetchPosition]);

  const disable = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      loading: false,
      error: null,
      enabled: false,
      needsConsent: false,
    });
  }, []);

  return { ...state, requestLocation, grantConsent, disable };
}
