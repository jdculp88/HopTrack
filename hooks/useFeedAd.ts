"use client";

import { useState, useEffect } from "react";

interface AdData {
  id: string;
  brewery_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  cta_url: string | null;
  cta_label: string;
  brewery: {
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  };
}

export function useFeedAd() {
  const [ad, setAd] = useState<AdData | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Try browser geolocation, fall back to no-location (which returns null)
    function fetchAd(lat: number, lng: number) {
      fetch(`/api/ads/feed?lat=${lat}&lng=${lng}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled && data.ad) setAd(data.ad);
        })
        .catch(() => {});
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAd(pos.coords.latitude, pos.coords.longitude),
        () => {} // silently fail — no ad shown without location
      );
    }

    return () => { cancelled = true; };
  }, []);

  return ad;
}
