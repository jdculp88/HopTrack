"use client";

import Image from "next/image";
import { useState } from "react";
import { generateGradientFromString } from "@/lib/utils";

// Curated high-quality Unsplash photos — brewery, taproom, and beer themes
const BANNER_PHOTOS = [
  "photo-1558642452-9d2a7deb7f62", // amber beer close-up
  "photo-1571613316887-6f8d5cbf7ef7", // tap handles in a bar
  "photo-1436076863939-06870fe779c2", // craft beer pints
  "photo-1504674900247-0877df9cc836", // food and beer
  "photo-1600788886242-5c96aabe3757", // brewery interior barrels
  "photo-1535958636474-b021ee887b13", // glasses of beer
  "photo-1566633806827-ab9e75916fb6", // brewery copper tanks
  "photo-1523567353-71ea9b2de0d8", // hops close up
  "photo-1507003211169-0a1dd7228f2d", // warm taproom
  "photo-1551986782-d0169b3f8fa7", // beer flight
];

function hashStringToIndex(str: string, len: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % len;
}

interface ProfileBannerProps {
  username: string;
  displayName: string;
  /** Custom banner URL (user-uploaded) takes priority */
  bannerUrl?: string | null;
}

export function ProfileBanner({ username, displayName, bannerUrl }: ProfileBannerProps) {
  const [imgError, setImgError] = useState(false);

  const photoId = BANNER_PHOTOS[hashStringToIndex(username, BANNER_PHOTOS.length)];
  const src = bannerUrl ?? `https://images.unsplash.com/${photoId}?w=1200&q=80&fit=crop&crop=center`;
  const fallbackGradient = generateGradientFromString(displayName + username);

  if (imgError) {
    return <div className="absolute inset-0" style={{ background: fallbackGradient }} />;
  }

  return (
    <Image
      src={src}
      alt={`${displayName}'s profile banner`}
      fill
      className="object-cover object-center"
      priority
      onError={() => setImgError(true)}
      sizes="(max-width: 768px) 100vw, 768px"
    />
  );
}
