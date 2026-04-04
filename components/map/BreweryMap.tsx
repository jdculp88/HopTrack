"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// leaflet.css imported in app/globals.css (avoids Turbopack CSS module panic)
import type { BreweryWithStats } from "@/types/database";

// Fix Leaflet's default icon paths (broken in bundled environments)
function fixLeafletIcons() {
  // @ts-expect-error — _getIconUrl is a private Leaflet method
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

// Custom gold pin icon for HopTrack
function createHopIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px;
      background: var(--accent-gold);
      border: 2px solid var(--bg);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--accent-gold) 40%, transparent);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// Blue "you are here" dot
function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 16px; height: 16px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

interface BreweryMapProps {
  breweries: BreweryWithStats[];
  className?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function BreweryMap({ breweries, className, userLocation }: BreweryMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Filter to breweries with coordinates
  const mapped = breweries.filter((b) => b.latitude != null && b.longitude != null);

  // Compute bounds for all points (breweries + user location)
  const allPoints: [number, number][] = mapped.map(b => [b.latitude!, b.longitude!]);
  if (userLocation) allPoints.push([userLocation.latitude, userLocation.longitude]);

  // Default center: user location > cluster average > continental US
  const center: [number, number] =
    userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : mapped.length > 0
        ? [
            mapped.reduce((s, b) => s + (b.latitude ?? 0), 0) / mapped.length,
            mapped.reduce((s, b) => s + (b.longitude ?? 0), 0) / mapped.length,
          ]
        : [39.5, -98.35];

  // If we have both user and breweries, use bounds to auto-fit
  const bounds = allPoints.length > 1
    ? L.latLngBounds(allPoints.map(([lat, lng]) => L.latLng(lat, lng)))
    : null;

  const zoom = bounds ? undefined : mapped.length > 1 ? 5 : mapped.length === 1 ? 13 : 4;

  const icon = createHopIcon();
  const userIcon = createUserIcon();

  return (
    <div className={className} style={{ borderRadius: "1.5rem", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={zoom ?? 5}
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [40, 40] }}
        style={{ height: "100%", width: "100%", background: "var(--surface)" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location blue dot */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div style={{ fontFamily: "DM Sans, sans-serif" }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: "#3b82f6" }}>
                  You are here
                </p>
              </div>
            </Popup>
          </Marker>
        )}

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
                    background: "var(--accent-gold)",
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
