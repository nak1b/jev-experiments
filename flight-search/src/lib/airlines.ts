import type { Region } from "./airports";

export type Airline = {
  code: string;
  name: string;
  hub: string;
  regions: readonly Region[];
  lowCost: boolean;
};

export const AIRLINES: readonly Airline[] = [
  { code: "DL", name: "Delta", hub: "ATL", regions: ["north-america", "latin-america", "europe", "asia"], lowCost: false },
  { code: "UA", name: "United", hub: "ORD", regions: ["north-america", "latin-america", "europe", "asia", "oceania"], lowCost: false },
  { code: "AA", name: "American Airlines", hub: "DFW", regions: ["north-america", "latin-america", "europe"], lowCost: false },
  { code: "B6", name: "JetBlue", hub: "JFK", regions: ["north-america", "latin-america"], lowCost: true },
  { code: "AS", name: "Alaska Airlines", hub: "SEA", regions: ["north-america"], lowCost: false },
  { code: "WN", name: "Southwest", hub: "DEN", regions: ["north-america"], lowCost: true },
  { code: "AC", name: "Air Canada", hub: "YYZ", regions: ["north-america", "europe", "asia"], lowCost: false },
  { code: "LA", name: "LATAM", hub: "GRU", regions: ["latin-america", "north-america", "europe"], lowCost: false },
  { code: "BA", name: "British Airways", hub: "LHR", regions: ["europe", "north-america", "middle-east", "africa", "asia"], lowCost: false },
  { code: "LH", name: "Lufthansa", hub: "FRA", regions: ["europe", "north-america", "middle-east", "africa", "asia"], lowCost: false },
  { code: "AF", name: "Air France", hub: "CDG", regions: ["europe", "north-america", "latin-america", "africa", "asia"], lowCost: false },
  { code: "KL", name: "KLM", hub: "AMS", regions: ["europe", "north-america", "africa", "asia"], lowCost: false },
  { code: "TP", name: "TAP Air Portugal", hub: "LIS", regions: ["europe", "north-america", "latin-america", "africa"], lowCost: false },
  { code: "IB", name: "Iberia", hub: "MAD", regions: ["europe", "north-america", "latin-america"], lowCost: false },
  { code: "FR", name: "Ryanair", hub: "DUB", regions: ["europe", "africa"], lowCost: true },
  { code: "U2", name: "easyJet", hub: "LHR", regions: ["europe", "africa"], lowCost: true },
  { code: "W6", name: "Wizz Air", hub: "BUD", regions: ["europe", "middle-east"], lowCost: true },
  { code: "TK", name: "Turkish Airlines", hub: "IST", regions: ["europe", "middle-east", "africa", "asia", "north-america"], lowCost: false },
  { code: "EK", name: "Emirates", hub: "DXB", regions: ["middle-east", "europe", "africa", "asia", "oceania", "north-america"], lowCost: false },
  { code: "QR", name: "Qatar Airways", hub: "DOH", regions: ["middle-east", "europe", "africa", "asia", "oceania", "north-america"], lowCost: false },
  { code: "SQ", name: "Singapore Airlines", hub: "SIN", regions: ["asia", "oceania", "europe", "north-america"], lowCost: false },
  { code: "CX", name: "Cathay Pacific", hub: "HKG", regions: ["asia", "oceania", "europe", "north-america"], lowCost: false },
  { code: "NH", name: "ANA", hub: "HND", regions: ["asia", "north-america", "europe"], lowCost: false },
  { code: "QF", name: "Qantas", hub: "SYD", regions: ["oceania", "asia", "north-america"], lowCost: false },
];

const BY_CODE = new Map(AIRLINES.map((airline) => [airline.code, airline]));

export function getAirline(code: string): Airline {
  const airline = BY_CODE.get(code);
  if (!airline) throw new Error(`Unknown airline code: ${code}`);
  return airline;
}
