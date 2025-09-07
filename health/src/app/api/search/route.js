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

    let results =
      data.local_results?.map((place) => ({
        name: place.title,
        lat: place.gps_coordinates?.latitude,
        lng: place.gps_coordinates?.longitude,
        rating: place.rating || 0,
        reviews: place.reviews || 0,
      })) || [];

    // sort by rating (desc) and reviews (desc), then pick top 3
    results = results
      .filter((p) => p.lat && p.lng)
      .sort((a, b) => {
        if (b.rating === a.rating) {
          return (b.reviews || 0) - (a.reviews || 0);
        }
        return b.rating - a.rating;
      })
      .slice(0, 3);

    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}