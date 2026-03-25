const BASE_URL = "https://api.openbrewerydb.org/v1";

export interface OpenBreweryResult {
  id: string;
  name: string;
  brewery_type: string;
  address_1: string | null;
  address_2: string | null;
  address_3: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  longitude: string | null;
  latitude: string | null;
  phone: string | null;
  website_url: string | null;
  state: string | null;
  street: string | null;
}

export async function searchBreweries(query: string, perPage = 10): Promise<OpenBreweryResult[]> {
  const res = await fetch(
    `${BASE_URL}/breweries?by_name=${encodeURIComponent(query)}&per_page=${perPage}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getBreweriesByCity(city: string, perPage = 10): Promise<OpenBreweryResult[]> {
  const res = await fetch(
    `${BASE_URL}/breweries?by_city=${encodeURIComponent(city)}&per_page=${perPage}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getBreweriesByLocation(
  lat: number,
  lng: number,
  perPage = 5
): Promise<OpenBreweryResult[]> {
  const res = await fetch(
    `${BASE_URL}/breweries?by_dist=${lat},${lng}&per_page=${perPage}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getBreweryById(id: string): Promise<OpenBreweryResult | null> {
  const res = await fetch(`${BASE_URL}/breweries/${id}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return res.json();
}

export function mapOpenBreweryToDb(b: OpenBreweryResult) {
  return {
    external_id: b.id,
    name: b.name,
    brewery_type: b.brewery_type as any,
    street: b.street || b.address_1 || null,
    city: b.city,
    state: b.state || b.state_province,
    postal_code: b.postal_code,
    country: b.country,
    phone: b.phone,
    website_url: b.website_url,
    latitude: b.latitude ? parseFloat(b.latitude) : null,
    longitude: b.longitude ? parseFloat(b.longitude) : null,
    verified: true,
  };
}

export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
