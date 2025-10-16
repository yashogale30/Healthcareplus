// lib/tools/placesSearchTool.ts
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const InputSchema = z.object({
  query: z.string().min(1, "query is required"),
  lat: z.string().default("19.076").describe("Latitude as string, default Mumbai"),
  lng: z.string().default("72.8777").describe("Longitude as string, default Mumbai"),
  zoom: z.string().default("15z").describe("Zoom suffix for ll parameter, e.g., 15z"),
  apiKey: z.string().optional().describe("Override SERPAPI_KEY from env"),
});

type Input = z.infer<typeof InputSchema>;

export const searchTopPlaces = tool(
  async ({ query, lat, lng, zoom, apiKey }: Input) => {
    const key = apiKey ?? process.env.SERPAPI_KEY;
    if (!key) throw new Error("Missing SERPAPI_KEY");

    // Build ll per SerpApi format: @lat,lng,zoom
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
      query
    )}&type=search&ll=@${lat},${lng},${zoom}&api_key=${key}`;

    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      throw new Error(`SerpApi error: ${resp.status}`);
    }
    const data = await resp.json();

    let results =
      data.local_results?.map((place: any) => ({
        name: place.title,
        lat: place.gps_coordinates?.latitude,
        lng: place.gps_coordinates?.longitude,
        rating: place.rating || 0,
        reviews: place.reviews || 0,
      })) || [];

    results = results
      .filter((p: any) => p.lat && p.lng)
      .sort((a: any, b: any) => {
        if (b.rating === a.rating) return (b.reviews || 0) - (a.reviews || 0);
        return b.rating - a.rating;
      })
      .slice(0, 3);

    // Tools should return strings
    return JSON.stringify({ results });
  },
  {
    name: "search_top_places",
    description:
      "Search Google Maps via SerpApi near given coordinates and return top 3 places by rating and reviews.",
    schema: InputSchema,
  }
);
