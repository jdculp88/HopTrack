"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { BreweryWithStats } from "@/types/database";

// Fix Leaflet's default icon paths (broken in bundled environments)
function fixLeafletIcons() {
  // @ts-expect-error — _getIconUrl is a private Leaflet method
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Custom gold pin icon for HopTrack
function createHopIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px;
      background: #D4A843;
      border: 2px solid #0F0E0C;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(212,168,67,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

interface BreweryMapProps {
  breweries: BreweryWithStats[];
  className?: string;
}

export function BreweryMap({ breweries, className }: BreweryMapProps) {
  useEffect(() => {
    // Leaflet CSS must be loaded client-side
    if (typeof window !== "undefined") {
      require("leaflet/dist/leaflet.css");
      fixLeafletIcons();
    }
  }, []);

  // Filter to breweries with coordinates
  const mapped = breweries.filter((b) => b.latitude != null && b.longitude != null);

  // Default center: continental US
  const center: [number, number] =
    mapped.length > 0
      ? [
          mapped.reduce((s, b) => s + (b.latitude ?? 0), 0) / mapped.length,
          mapped.reduce((s, b) => s + (b.longitude ?? 0), 0) / mapped.length,
        ]
      : [39.5, -98.35];

  const zoom = mapped.length > 1 ? 5 : mapped.length === 1 ? 13 : 4;

  const icon = createHopIcon();

  return (
    <div className={className} style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "var(--surface)" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapped.map((brewery) => (
          <Marker
            key={brewery.id}
            position={[brewery.latitude!, brewery.longitude!]}
            icon={icon}
          >
            <Popup>
              <div style={{ fontFamily: "DM Sans, sans-serif", minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px", color: "var(--bg)" }}>
                  {brewery.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>
                  {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                  {brewery.brewery_type && ` · ${brewery.brewery_type}`}
                </p>
                <a
                  href={`/brewery/${brewery.id}`}
                  style={{
                    display: "inline-block",
                    background: "#D4A843",
                    color: "var(--bg)",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  View Brewery →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
