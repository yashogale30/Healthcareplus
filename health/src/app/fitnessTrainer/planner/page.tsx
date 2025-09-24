"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/lib/authContext';

export default function FitnessTrainer() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    weightKg: "",
    heightCm: "",
    activityLevel: "",
    goal: "",
    oi: "",
    dietPreference: "",
  });

  const [output, setOutput] = useState<{
    workoutPlan: any[];
    dietPlan: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generatePlan = async () => {
    setErrorMsg("");
    setLoading(true);
    setOutput(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id || null }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output);
      } else {
        setErrorMsg(data.error || "Error generating plan.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPlan = async () => {
    if (!user?.id) return null;
    
    try {
      const response = await fetch(`/api/getLatestPlan?userId=${user.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.plan;
      }
    } catch (error) {
      console.error("Error fetching latest plan:", error);
    }
    return null;
  };

  const implementPlan = async () => {
    if (!output) return;
    if (!user?.id) {
      setErrorMsg("You must be logged in to save your plan.");
      return;
    }
    const payload = {
      user_id: user.id,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      weight_kg: parseFloat(form.weightKg),
      height_cm: parseFloat(form.heightCm),
      activity_level: form.activityLevel,
      goal: form.goal,
      oi: form.oi || '',
      diet_preference: form.dietPreference,
      workout_plan: output.workoutPlan || [],
      diet_plan: output.dietPlan || []
    };

    console.log('Saving plan payload: ', payload);
    try {
      const res = await fetch("/api/savePlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const latestPlan = await fetchLatestPlan();
        if (latestPlan) {
          console.log("Latest plan fetched:", latestPlan);
          setOutput({
            workoutPlan: latestPlan.workout_plan || [],
            dietPlan: latestPlan.diet_plan || []
          });
          setForm({
            name: latestPlan.name || "",
            age: latestPlan.age?.toString() || "",
            gender: latestPlan.gender || "",
            weightKg: latestPlan.weight_kg?.toString() || "",
            heightCm: latestPlan.height_cm?.toString() || "",
            activityLevel: latestPlan.activity_level || "",
            goal: latestPlan.goal || "",
            oi: latestPlan.oi || "",
            dietPreference: latestPlan.diet_preference || "",
          });
          router.push("/fitnessTrainer/tracker");
        } else {
          router.push("/fitnessTrainer/tracker");
        }
      } else {
        setErrorMsg(data.error || "Failed to save plan.");
      }
    } catch {
      setErrorMsg("Something went wrong while saving.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      age: "",
      gender: "",
      weightKg: "",
      heightCm: "",
      activityLevel: "",
      goal: "",
      oi: "",
      dietPreference: "",
    });
    setOutput(null);
    setErrorMsg("");
  };

  useEffect(() => {
    const loadExistingPlan = async () => {
      if (user?.id) {
        const latestPlan = await fetchLatestPlan();
        if (latestPlan) {
          setForm({
            name: latestPlan.name || "",
            age: latestPlan.age?.toString() || "",
            gender: latestPlan.gender || "",
            weightKg: latestPlan.weight_kg?.toString() || "",
            heightCm: latestPlan.height_cm?.toString() || "",
            activityLevel: latestPlan.activity_level || "",
            goal: latestPlan.goal || "",
            oi: latestPlan.oi || "",
            dietPreference: latestPlan.diet_preference || "",
          });
        }
      }
    };

    loadExistingPlan();
  }, [user?.id]);

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
            AI-Powered Fitness & Nutrition
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Fitness <span className="text-[#C0A9BD]">Trainer</span>
          </h1>
          
          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Get personalized workout plans and diet recommendations tailored to your goals and preferences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Form Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💪</span>
              </div> */}
              <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Personal Information</h2>
              <p className="text-[#64766A]/70">Tell us about yourself to create your perfect fitness plan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Age</label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Enter your weight"
                  value={form.weightKg}
                  onChange={(e) => handleChange("weightKg", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Height (cm)</label>
                <input
                  type="number"
                  placeholder="Enter your height"
                  value={form.heightCm}
                  onChange={(e) => handleChange("heightCm", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#64766A]">Activity Level</label>
                <select
                  value={form.activityLevel}
                  onChange={(e) => handleChange("activityLevel", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                >
                  <option value="">Select activity level</option>
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly active">Lightly active</option>
                  <option value="Moderately active">Moderately active</option>
                  <option value="Very active">Very active</option>
                </select>
              </div>

              {/* Fitness Goal */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#64766A]">Fitness Goal</label>
                <input
                  type="text"
                  placeholder="e.g., Lose weight, Build muscle, Stay fit..."
                  value={form.goal}
                  onChange={(e) => handleChange("goal", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Other Information */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#64766A]">Additional Information</label>
                <input
                  type="text"
                  placeholder="Any injuries, preferences, or special considerations..."
                  value={form.oi}
                  onChange={(e) => handleChange("oi", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Diet Preference */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#64766A]">Diet Preference</label>
                <select
                  value={form.dietPreference}
                  onChange={(e) => handleChange("dietPreference", e.target.value)}
                  className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                >
                  <option value="">Select diet preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8 text-center">
              <button
                onClick={generatePlan}
                disabled={loading}
                className="px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Your Plan...
                  </span>
                ) : (
                  "Generate My Fitness Plan"
                )}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center"
                >
                  <p className="text-red-600 font-medium">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Workout Plan */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏋️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#64766A] mb-2">Your Workout Plan</h3>
                    <p className="text-[#64766A]/70">Follow this personalized exercise routine</p>
                  </div>

                  <div className="space-y-6">
                    {output.workoutPlan.map((day, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-[#C0A9BD]/10 to-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-2xl p-6"
                      >
                        <h4 className="text-lg font-semibold text-[#64766A] mb-4">{day.day}</h4>
                        <div className="grid gap-3">
                          {day.exercises.map((ex: any, j: number) => (
                            <div key={j} className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                              <span className="font-medium text-[#64766A]">{ex.name}</span>
                              <span className="text-[#64766A]/70">{ex.sets} sets × {ex.reps} reps</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Diet Plan */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🥗</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#64766A] mb-2">Your Diet Plan</h3>
                    <p className="text-[#64766A]/70">Nutrition plan tailored to your goals</p>
                  </div>

                  <div className="space-y-6">
                    {output.dietPlan.map((meal, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-[#94A7AE]/10 to-[#64766A]/10 border border-[#94A7AE]/20 rounded-2xl p-6"
                      >
                        <h4 className="text-lg font-semibold text-[#64766A] mb-4">{meal.meal}</h4>
                        <div className="grid gap-3">
                          {meal.items.map((item: any, j: number) => (
                            <div key={j} className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                              <span className="font-medium text-[#64766A]">{item.food}</span>
                              <span className="text-[#64766A]/70">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={implementPlan}
                    className="px-8 py-4 bg-[#C0A9BD] text-white rounded-full text-lg font-medium hover:bg-[#C0A9BD]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Implement My Plan
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-8 py-4 bg-white/70 backdrop-blur-sm text-[#64766A] rounded-full text-lg font-medium hover:bg-white/90 transition-all duration-300 border border-[#C0A9BD]/30"
                  >
                    Create New Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
