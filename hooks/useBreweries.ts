"use client";

import { useState, useEffect, useCallback } from "react";
import type { Brewery } from "@/types/database";

export function useNearbyBreweries() {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const detect = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        try {
          const res = await fetch(`/api/breweries?lat=${lat}&lng=${lng}&limit=5`);
          const data = await res.json();
          setBreweries(data.breweries ?? []);
        } catch {
          setError("Failed to load nearby breweries.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied.");
      }
    );
  }, []);

  return { breweries, loading, error, userLocation, detect };
}

export function useBrewerySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Brewery[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/breweries?q=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data.breweries ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, loading };
}
