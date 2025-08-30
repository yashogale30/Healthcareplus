import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const lat = searchParams.get("lat") || "19.076";
  const lng = searchParams.get("lng") || "72.8777";

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.SERPAPI_KEY;
    const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
      query
    )}&ll=@${lat},${lng},15z&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const results =
      data.local_results?.map((place) => ({
        name: place.title,
        lat: place.gps_coordinates?.latitude,
        lng: place.gps_coordinates?.longitude,
      })) || [];

    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
