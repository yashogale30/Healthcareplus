"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";

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

export default function CalorieTracker() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

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
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type || "image/jpeg",
        }),
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

  async function logFood(item: Item) {
    if (!user) {
      setError("You must be signed in to log food.");
      return;
    }
    setSaving(item.name);
    try {
      const { error } = await supabase.from("food_logs").insert({
        user_id: user.id,
        food_name: item.name,
        calories: Math.round(item.calories_kcal),
        log_date: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || "Failed to save food log.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A]">
            <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
            AI-Powered Nutrition Analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Calorie <span className="text-[#C0A9BD]">Tracker</span>
          </h1>

          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Upload your food photo and get instant nutrition insights powered by advanced AI technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Upload Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#64766A] mb-4">
                Upload Food Image
              </h2>
              <p className="text-[#64766A]/70 mb-6">
                Take a photo or upload an image of your meal for instant nutritional analysis.
              </p>

              {/* File Input */}
              <div className="flex flex-col items-center gap-4">
                <label className="relative cursor-pointer">
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    Choose Image
                  </div>
                </label>
              </div>
            </div>

            {/* Preview Section */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  key="preview"
                  className="mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white/60 rounded-2xl p-6 border border-[#C0A9BD]/20">
                    <img
                      src={preview}
                      alt="Food preview"
                      className="rounded-xl shadow-md max-h-80 mx-auto mb-6"
                    />

                    <div className="text-center">
                      <button
                        onClick={analyze}
                        disabled={!file || loading}
                        className="px-8 py-4 bg-[#C0A9BD] text-white rounded-full text-lg font-medium hover:bg-[#C0A9BD]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Analyzing...
                          </span>
                        ) : (
                          "Analyze Nutrition"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-600 font-medium">⚠️ {error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
              {data && (
                <motion.div
                  key="results"
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-[#64766A] mb-2">
                      Nutrition Analysis
                    </h3>
                    <p className="text-[#64766A]/70">
                      Here's what we found in your food image
                    </p>
                  </div>

                  {data.items?.length ? (
                    <div className="space-y-6">
                      {data.items.map((item, i) => (
                        <motion.div
                          key={i}
                          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#C0A9BD]/20 p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-semibold text-[#64766A] mb-1">
                                {item.name}
                              </h4>
                              <p className="text-[#64766A]/70">
                                Estimated portion: {item.estimated_portion_g}g
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 text-right">
                              <p className="text-2xl font-bold text-[#C0A9BD]">
                                {Math.round(item.calories_kcal)} kcal
                              </p>
                            </div>
                          </div>

                          {/* Nutrition Facts */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 bg-gradient-to-br from-[#C0A9BD]/10 to-[#94A7AE]/10 rounded-xl">
                              <p className="text-sm text-[#64766A]/60 mb-1">
                                Protein
                              </p>
                              <p className="text-lg font-semibold text-[#64766A]">
                                {item.protein_g}g
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-[#94A7AE]/10 to-[#64766A]/10 rounded-xl">
                              <p className="text-sm text-[#64766A]/60 mb-1">
                                Carbs
                              </p>
                              <p className="text-lg font-semibold text-[#64766A]">
                                {item.carbs_g}g
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-br from-[#64766A]/10 to-[#C0A9BD]/10 rounded-xl">
                              <p className="text-sm text-[#64766A]/60 mb-1">
                                Fat
                              </p>
                              <p className="text-lg font-semibold text-[#64766A]">
                                {item.fat_g}g
                              </p>
                            </div>
                          </div>

                          {/* Portion Calculator */}
                          <div className="border-t border-[#C0A9BD]/20 pt-4">
                            <p className="text-sm font-medium text-[#64766A] mb-3">
                              Calories for different portions:
                            </p>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {[100, 150, 200].map((g) => (
                                <div
                                  key={g}
                                  className="text-center p-3 bg-white/60 border border-[#C0A9BD]/20 rounded-xl"
                                >
                                  <p className="text-xs text-[#64766A]/60 mb-1">
                                    {g}g
                                  </p>
                                  <p className="font-semibold text-[#64766A]">
                                    {Math.round(scaledCalories(item, g))} kcal
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Ate Button */}
                            <div className="flex justify-center">
  <button
    onClick={() => logFood(item)}
    disabled={saving === item.name}
    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 
      ${saving === item.name 
        ? "bg-[#64766A]/70 text-white shadow-inner cursor-not-allowed" 
        : "bg-gradient-to-r from-[#64766A] to-[#4f5e54] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"} 
    `}
  >
    {saving === item.name ? "Saving..." : "Ate"}
  </button>
</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white/60 rounded-2xl border border-[#C0A9BD]/20">
                      <p className="text-[#64766A]/70">
                        No food items detected in the image. Please try another
                        image.
                      </p>
                    </div>
                  )}

                  {data.notes && (
                    <div className="mt-6 p-4 bg-[#94A7AE]/10 border border-[#94A7AE]/20 rounded-2xl">
                      <p className="text-sm text-[#64766A]/70">
                        <span className="font-medium">Note:</span> {data.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
