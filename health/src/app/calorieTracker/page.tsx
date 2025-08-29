"use client";

import Navbar from "@/components/navbar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ import

type Item = {
  name: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  estimated_portion_g: number;
};

type ApiResponse = {
  items: Item[];
  notes: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (base64) resolve(base64);
        else reject(new Error("Failed to convert file to base64"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const imageBase64 = await toBase64(file);
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: file.type || "image/jpeg" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Request failed");
      setData(json as ApiResponse);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function scaledCalories(item: Item, grams: number) {
    if (item.estimated_portion_g > 0) {
      return (item.calories_kcal / item.estimated_portion_g) * grams;
    }
    return item.calories_kcal;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-200 to-orange-100">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6 pt-24 space-y-6">
        <motion.div
          className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Image Calorie Tracker
          </h1>
          <p className="text-center text-gray-700 mt-2">
            Upload your food photo and get instant nutrition insights.
          </p>

          {/* File Input */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setData(null);
                setError(null);
                if (f) setPreview(URL.createObjectURL(f));
                else setPreview(null);
              }}
              className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-purple-500 file:text-white
                         hover:file:bg-purple-600"
            />
          </div>

          {/* Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                key="preview"
                className="mt-4 flex flex-col items-center gap-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={preview}
                  alt="preview"
                  className="rounded-xl shadow-md max-h-80 mx-auto"
                />

                {/* Analyze Button */}
                <button
                  onClick={analyze}
                  disabled={!file || loading}
                  className="mt-4 px-6 py-2 rounded-lg bg-purple-600 text-white font-medium shadow-md
                             hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing…" : "Analyze Image"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                className="text-red-600 mt-4 text-center font-medium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                ❌ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {data && (
              <motion.section
                key="results"
                className="space-y-4 mt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-lg font-semibold text-gray-900">Results</h2>
                {data.items?.length ? (
                  <ul className="space-y-4">
                    {data.items.map((item, i) => (
                      <motion.li
                        key={i}
                        className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 hover:shadow-lg transition"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-700">
                          Estimated portion: {item.estimated_portion_g} g
                        </p>
                        <p className="text-gray-900 font-medium">
                          ≈ {Math.round(item.calories_kcal)} kcal
                        </p>
                        <p className="text-sm text-gray-600">
                          Protein: {item.protein_g} g · Carbs: {item.carbs_g} g · Fat:{" "}
                          {item.fat_g} g
                        </p>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          {[100, 150, 200].map((g) => (
                            <div
                              key={g}
                              className="border border-purple-300 bg-white/60 rounded-lg p-2"
                            >
                              <p className="text-xs text-gray-500">{g} g</p>
                              <p className="font-medium text-gray-900">
                                {Math.round(scaledCalories(item, g))} kcal
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">No items detected.</p>
                )}
                <p className="text-xs text-gray-500">Notes: {data.notes}</p>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}