"use client";
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";

type Place = {
  lat: number;
  lng: number;
  name: string;
};

export default function ClinicMap() {
  const mapRef = useRef<any>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const L = await import("leaflet");

      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Default center (Mumbai), will update if user allows location
      const map = L.map("map").setView([19.076, 72.8777], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
      }).addTo(map);

      // ✅ Ask user for location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserCoords([latitude, longitude]);

            map.setView([latitude, longitude], 14);

            // Marker for user's location
            L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup("📍 You are here")
              .openPopup();
          },
          (err) => {
            console.warn("Geolocation denied or unavailable", err);
          }
        );
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  async function searchPlaces() {
    const searchInput = document.getElementById("search") as HTMLInputElement | null;
    const query = searchInput?.value;
    if (!query || !mapRef.current) return;

    const [lat, lng] = userCoords || [19.076, 72.8777]; // fallback to Mumbai
    const res = await fetch(`/api/search?query=${query}&lat=${lat}&lng=${lng}`);
    const data = await res.json();

    // Import leaflet once here
    const L = await import("leaflet");

    // Clear old markers except user's location
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add back user marker
    if (userCoords) {
      L.marker(userCoords)
        .addTo(mapRef.current)
        .bindPopup("📍 You are here");
    }

    // Add places
    (data.results as Place[]).forEach((place: Place) => {
      L.marker([place.lat, place.lng])
        .addTo(mapRef.current)
        .bindPopup(place.name);
    });
  }
  return (
    <div>
      <div className="search-container">
        <input id="search" type="text" placeholder="Search places..." />
        <button onClick={searchPlaces}>Search</button>
        <button onClick={() => router.push("/")}>Back</button>
      </div>
      <div id="map"></div>
    </div>
  );
}

