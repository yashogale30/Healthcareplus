"use client";
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

type Place = {
  lat: number;
  lng: number;
  name: string;
};

export default function ClinicMap() {
  const mapRef = useRef<any>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable'>('requesting');
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

      // Ask user for location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserCoords([latitude, longitude]);
            setLocationStatus('granted');

            map.setView([latitude, longitude], 14);

            // Marker for user's location
            L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup("📍 You are here")
              .openPopup();
          },
          (err) => {
            console.warn("Geolocation denied or unavailable", err);
            setLocationStatus('denied');
          }
        );
      } else {
        setLocationStatus('unavailable');
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
    if (!searchQuery.trim() || !mapRef.current) return;
    
    setLoading(true);

    const [lat, lng] = userCoords || [19.076, 72.8777]; // fallback to Mumbai
    const res = await fetch(`/api/search?query=${searchQuery}&lat=${lat}&lng=${lng}`);
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
        .bindPopup(`
          <div class="p-2">
            <strong class="text-[#64766A]">${place.name}</strong>
          </div>
        `);
    });

    setLoading(false);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlaces();
    }
  };

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A]">
            <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
            Location-Based Healthcare Finder
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Find <span className="text-[#C0A9BD]">Clinics</span> Nearby
          </h1>
          
          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Locate healthcare facilities, hospitals, and clinics in your area with real-time mapping.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for hospitals, clinics, pharmacies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-4 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-[#64766A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={searchPlaces}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-4 bg-[#64766A] text-white rounded-xl font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>

            {/* Location Status */}
            <div className="mt-4 flex items-center justify-center">
              {locationStatus === 'requesting' && (
                <div className="flex items-center gap-2 text-[#94A7AE]">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Requesting location access...</span>
                </div>
              )}
              {locationStatus === 'granted' && (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Location access granted</span>
                </div>
              )}
              {locationStatus === 'denied' && (
                <div className="flex items-center gap-2 text-orange-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Location access denied - showing default area</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div 
              id="map" 
              className="w-full h-[600px] rounded-3xl"
              style={{
                filter: 'hue-rotate(20deg) saturate(0.8)'
              }}
            ></div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(192, 169, 189, 0.2);
        }
        
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        
        .leaflet-control-zoom a {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(192, 169, 189, 0.2);
          color: #64766A;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(192, 169, 189, 0.2);
        }
        
        .leaflet-bar {
          border: 1px solid rgba(192, 169, 189, 0.2);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
