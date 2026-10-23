import { db, isDbConfigured } from "@/lib/db";

export type Neighbourhood = { id: string; name: string; city: string; country: string; lat: number; lng: number };

// Approximate city-area coordinates, used only for fetching rainfall data. Mirrors supabase/schema.sql.
export const SEED_NEIGHBOURHOODS: Neighbourhood[] = [
  { id: "madina-town-faisalabad", name: "Madina Town", city: "Faisalabad", country: "Pakistan", lat: 31.43, lng: 73.09 },
  { id: "gulberg-lahore", name: "Gulberg", city: "Lahore", country: "Pakistan", lat: 31.51, lng: 74.35 },
  { id: "central-jakarta", name: "Central Jakarta", city: "Jakarta", country: "Indonesia", lat: -6.18, lng: 106.83 },
];

export type NeighbourhoodResult = { items: Neighbourhood[]; source: "database" | "seed"; note?: string };

export async function getNeighbourhoods(): Promise<NeighbourhoodResult> {
  if (!isDbConfigured()) {
    return { items: SEED_NEIGHBOURHOODS, source: "seed", note: "Database not configured; showing built-in seed data." };
  }
  const { data, error } = await db().from("neighbourhoods").select("id,name,city,country,lat,lng").order("city");
  if (error || !data?.length) {
    return { items: SEED_NEIGHBOURHOODS, source: "seed", note: "Database unreachable or empty; showing built-in seed data." };
  }
  return { items: data as Neighbourhood[], source: "database" };
}
