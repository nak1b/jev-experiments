export type Region =
  | "north-america"
  | "latin-america"
  | "europe"
  | "middle-east"
  | "africa"
  | "asia"
  | "oceania";

export type Airport = {
  code: string;
  city: string;
  country: string;
  region: Region;
  lat: number;
  lon: number;
  /* Fixed offset in hours. Sample data ignores daylight saving time. */
  utcOffset: number;
};

/* One airport per city, so a city name maps to exactly one option. */
export const AIRPORTS: readonly Airport[] = [
  { code: "JFK", city: "New York", country: "United States", region: "north-america", lat: 40.64, lon: -73.78, utcOffset: -4 },
  { code: "BOS", city: "Boston", country: "United States", region: "north-america", lat: 42.37, lon: -71.01, utcOffset: -4 },
  { code: "IAD", city: "Washington, D.C.", country: "United States", region: "north-america", lat: 38.95, lon: -77.46, utcOffset: -4 },
  { code: "ATL", city: "Atlanta", country: "United States", region: "north-america", lat: 33.64, lon: -84.43, utcOffset: -4 },
  { code: "MIA", city: "Miami", country: "United States", region: "north-america", lat: 25.8, lon: -80.29, utcOffset: -4 },
  { code: "MCO", city: "Orlando", country: "United States", region: "north-america", lat: 28.43, lon: -81.31, utcOffset: -4 },
  { code: "ORD", city: "Chicago", country: "United States", region: "north-america", lat: 41.98, lon: -87.9, utcOffset: -5 },
  { code: "MSY", city: "New Orleans", country: "United States", region: "north-america", lat: 29.99, lon: -90.26, utcOffset: -5 },
  { code: "DFW", city: "Dallas", country: "United States", region: "north-america", lat: 32.9, lon: -97.04, utcOffset: -5 },
  { code: "AUS", city: "Austin", country: "United States", region: "north-america", lat: 30.19, lon: -97.67, utcOffset: -5 },
  { code: "DEN", city: "Denver", country: "United States", region: "north-america", lat: 39.86, lon: -104.67, utcOffset: -6 },
  { code: "PHX", city: "Phoenix", country: "United States", region: "north-america", lat: 33.43, lon: -112.01, utcOffset: -7 },
  { code: "LAS", city: "Las Vegas", country: "United States", region: "north-america", lat: 36.08, lon: -115.15, utcOffset: -7 },
  { code: "LAX", city: "Los Angeles", country: "United States", region: "north-america", lat: 33.94, lon: -118.41, utcOffset: -7 },
  { code: "SAN", city: "San Diego", country: "United States", region: "north-america", lat: 32.73, lon: -117.19, utcOffset: -7 },
  { code: "SFO", city: "San Francisco", country: "United States", region: "north-america", lat: 37.62, lon: -122.38, utcOffset: -7 },
  { code: "SEA", city: "Seattle", country: "United States", region: "north-america", lat: 47.45, lon: -122.31, utcOffset: -7 },
  { code: "HNL", city: "Honolulu", country: "United States", region: "north-america", lat: 21.32, lon: -157.92, utcOffset: -10 },
  { code: "YYZ", city: "Toronto", country: "Canada", region: "north-america", lat: 43.68, lon: -79.63, utcOffset: -4 },
  { code: "YVR", city: "Vancouver", country: "Canada", region: "north-america", lat: 49.19, lon: -123.18, utcOffset: -7 },
  { code: "MEX", city: "Mexico City", country: "Mexico", region: "north-america", lat: 19.44, lon: -99.07, utcOffset: -6 },
  { code: "CUN", city: "Cancún", country: "Mexico", region: "north-america", lat: 21.04, lon: -86.87, utcOffset: -5 },
  { code: "SJU", city: "San Juan", country: "Puerto Rico", region: "latin-america", lat: 18.44, lon: -66.0, utcOffset: -4 },
  { code: "BOG", city: "Bogotá", country: "Colombia", region: "latin-america", lat: 4.7, lon: -74.15, utcOffset: -5 },
  { code: "LIM", city: "Lima", country: "Peru", region: "latin-america", lat: -12.02, lon: -77.11, utcOffset: -5 },
  { code: "GRU", city: "São Paulo", country: "Brazil", region: "latin-america", lat: -23.43, lon: -46.47, utcOffset: -3 },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil", region: "latin-america", lat: -22.81, lon: -43.25, utcOffset: -3 },
  { code: "EZE", city: "Buenos Aires", country: "Argentina", region: "latin-america", lat: -34.82, lon: -58.54, utcOffset: -3 },
  { code: "LHR", city: "London", country: "United Kingdom", region: "europe", lat: 51.47, lon: -0.45, utcOffset: 1 },
  { code: "EDI", city: "Edinburgh", country: "United Kingdom", region: "europe", lat: 55.95, lon: -3.37, utcOffset: 1 },
  { code: "DUB", city: "Dublin", country: "Ireland", region: "europe", lat: 53.43, lon: -6.25, utcOffset: 1 },
  { code: "KEF", city: "Reykjavík", country: "Iceland", region: "europe", lat: 63.99, lon: -22.62, utcOffset: 0 },
  { code: "LIS", city: "Lisbon", country: "Portugal", region: "europe", lat: 38.77, lon: -9.13, utcOffset: 1 },
  { code: "OPO", city: "Porto", country: "Portugal", region: "europe", lat: 41.25, lon: -8.68, utcOffset: 1 },
  { code: "MAD", city: "Madrid", country: "Spain", region: "europe", lat: 40.49, lon: -3.57, utcOffset: 2 },
  { code: "BCN", city: "Barcelona", country: "Spain", region: "europe", lat: 41.3, lon: 2.08, utcOffset: 2 },
  { code: "PMI", city: "Palma de Mallorca", country: "Spain", region: "europe", lat: 39.55, lon: 2.74, utcOffset: 2 },
  { code: "CDG", city: "Paris", country: "France", region: "europe", lat: 49.01, lon: 2.55, utcOffset: 2 },
  { code: "NCE", city: "Nice", country: "France", region: "europe", lat: 43.66, lon: 7.21, utcOffset: 2 },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", region: "europe", lat: 52.31, lon: 4.76, utcOffset: 2 },
  { code: "FRA", city: "Frankfurt", country: "Germany", region: "europe", lat: 50.04, lon: 8.56, utcOffset: 2 },
  { code: "MUC", city: "Munich", country: "Germany", region: "europe", lat: 48.35, lon: 11.79, utcOffset: 2 },
  { code: "BER", city: "Berlin", country: "Germany", region: "europe", lat: 52.37, lon: 13.5, utcOffset: 2 },
  { code: "ZRH", city: "Zurich", country: "Switzerland", region: "europe", lat: 47.46, lon: 8.55, utcOffset: 2 },
  { code: "MXP", city: "Milan", country: "Italy", region: "europe", lat: 45.63, lon: 8.72, utcOffset: 2 },
  { code: "FCO", city: "Rome", country: "Italy", region: "europe", lat: 41.8, lon: 12.25, utcOffset: 2 },
  { code: "VIE", city: "Vienna", country: "Austria", region: "europe", lat: 48.11, lon: 16.57, utcOffset: 2 },
  { code: "PRG", city: "Prague", country: "Czechia", region: "europe", lat: 50.1, lon: 14.26, utcOffset: 2 },
  { code: "BUD", city: "Budapest", country: "Hungary", region: "europe", lat: 47.44, lon: 19.26, utcOffset: 2 },
  { code: "WAW", city: "Warsaw", country: "Poland", region: "europe", lat: 52.17, lon: 20.97, utcOffset: 2 },
  { code: "CPH", city: "Copenhagen", country: "Denmark", region: "europe", lat: 55.62, lon: 12.66, utcOffset: 2 },
  { code: "OSL", city: "Oslo", country: "Norway", region: "europe", lat: 60.19, lon: 11.1, utcOffset: 2 },
  { code: "ARN", city: "Stockholm", country: "Sweden", region: "europe", lat: 59.65, lon: 17.92, utcOffset: 2 },
  { code: "HEL", city: "Helsinki", country: "Finland", region: "europe", lat: 60.32, lon: 24.95, utcOffset: 3 },
  { code: "SPU", city: "Split", country: "Croatia", region: "europe", lat: 43.54, lon: 16.3, utcOffset: 2 },
  { code: "ATH", city: "Athens", country: "Greece", region: "europe", lat: 37.94, lon: 23.94, utcOffset: 3 },
  { code: "IST", city: "Istanbul", country: "Türkiye", region: "europe", lat: 41.26, lon: 28.74, utcOffset: 3 },
  { code: "TLV", city: "Tel Aviv", country: "Israel", region: "middle-east", lat: 32.01, lon: 34.89, utcOffset: 3 },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", region: "middle-east", lat: 25.25, lon: 55.36, utcOffset: 4 },
  { code: "DOH", city: "Doha", country: "Qatar", region: "middle-east", lat: 25.27, lon: 51.61, utcOffset: 3 },
  { code: "CAI", city: "Cairo", country: "Egypt", region: "africa", lat: 30.12, lon: 31.41, utcOffset: 3 },
  { code: "RAK", city: "Marrakesh", country: "Morocco", region: "africa", lat: 31.61, lon: -8.04, utcOffset: 1 },
  { code: "NBO", city: "Nairobi", country: "Kenya", region: "africa", lat: -1.32, lon: 36.93, utcOffset: 3 },
  { code: "CPT", city: "Cape Town", country: "South Africa", region: "africa", lat: -33.97, lon: 18.6, utcOffset: 2 },
  { code: "DEL", city: "Delhi", country: "India", region: "asia", lat: 28.56, lon: 77.1, utcOffset: 5.5 },
  { code: "BOM", city: "Mumbai", country: "India", region: "asia", lat: 19.09, lon: 72.87, utcOffset: 5.5 },
  { code: "BKK", city: "Bangkok", country: "Thailand", region: "asia", lat: 13.69, lon: 100.75, utcOffset: 7 },
  { code: "SIN", city: "Singapore", country: "Singapore", region: "asia", lat: 1.36, lon: 103.99, utcOffset: 8 },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "asia", lat: 2.75, lon: 101.71, utcOffset: 8 },
  { code: "DPS", city: "Bali", country: "Indonesia", region: "asia", lat: -8.75, lon: 115.17, utcOffset: 8 },
  { code: "MNL", city: "Manila", country: "Philippines", region: "asia", lat: 14.51, lon: 121.02, utcOffset: 8 },
  { code: "HKG", city: "Hong Kong", country: "China", region: "asia", lat: 22.31, lon: 113.92, utcOffset: 8 },
  { code: "PVG", city: "Shanghai", country: "China", region: "asia", lat: 31.14, lon: 121.81, utcOffset: 8 },
  { code: "TPE", city: "Taipei", country: "Taiwan", region: "asia", lat: 25.08, lon: 121.23, utcOffset: 8 },
  { code: "ICN", city: "Seoul", country: "South Korea", region: "asia", lat: 37.46, lon: 126.44, utcOffset: 9 },
  { code: "HND", city: "Tokyo", country: "Japan", region: "asia", lat: 35.55, lon: 139.78, utcOffset: 9 },
  { code: "SYD", city: "Sydney", country: "Australia", region: "oceania", lat: -33.94, lon: 151.18, utcOffset: 10 },
  { code: "MEL", city: "Melbourne", country: "Australia", region: "oceania", lat: -37.67, lon: 144.84, utcOffset: 10 },
  { code: "AKL", city: "Auckland", country: "New Zealand", region: "oceania", lat: -37.01, lon: 174.79, utcOffset: 12 },
];

const BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export function getAirport(code: string): Airport {
  const airport = BY_CODE.get(code);
  if (!airport) throw new Error(`Unknown airport code: ${code}`);
  return airport;
}

export function isAirportCode(code: string): boolean {
  return BY_CODE.has(code);
}

export function distanceKm(from: Airport, to: Airport): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
