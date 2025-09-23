"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import Loader from "@/components/ui/loader";

export default function Tracker() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tracking, setTracking] = useState<{ workout_done: any; diet_consumed: any }>({
    workout_done: {},
    diet_consumed: {},
  });
  const [userWorkout, setUserWorkout] = useState("");
  const [userDiet, setUserDiet] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Custom scrollbar styles for workout section
  const workoutScrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(192, 169, 189, 0.3) transparent',
    '&::WebkitScrollbar': {
      width: '8px',
    },
    '&::WebkitScrollbarTrack': {
      background: 'transparent',
      borderRadius: '10px',
    },
    '&::WebkitScrollbarThumb': {
      background: 'rgba(192, 169, 189, 0.3)',
      borderRadius: '10px',
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '&::WebkitScrollbarThumb:hover': {
      background: 'rgba(192, 169, 189, 0.5)',
    },
  };

  // Custom scrollbar styles for diet section
  const dietScrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'rgba(148, 167, 174, 0.3) transparent',
    '&::WebkitScrollbar': {
      width: '8px',
    },
    '&::WebkitScrollbarTrack': {
      background: 'transparent',
      borderRadius: '10px',
    },
    '&::WebkitScrollbarThumb': {
      background: 'rgba(148, 167, 174, 0.3)',
      borderRadius: '10px',
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '&::WebkitScrollbarThumb:hover': {
      background: 'rgba(148, 167, 174, 0.5)',
    },
  };

  // ... (keeping all the existing useEffect hooks and functions unchanged)
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // fetch plans
      const { data: plansData } = await supabase
        .from("fitness_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPlans(plansData || []);
      if (plansData?.length) setSelectedPlan(plansData[0]);

      // fetch today's tracking
      if (plansData?.length) {
        const { data: trackingData } = await supabase
          .from("daily_tracking")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", date)
          .single();

        if (trackingData) {
          setTracking({
            workout_done: trackingData.workout_done || {},
            diet_consumed: trackingData.diet_consumed || {},
          });
          setAnalysis(trackingData.ai_feedback || null);
        } else {
          setTracking({ workout_done: {}, diet_consumed: {} });
          setAnalysis(null);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, date]);

  const todayPlan = useMemo(() => {
    if (!selectedPlan) return null;
    const dayIndex = (new Date(date).getDay() + 6) % 7; // Monday=0
    return selectedPlan.workout_plan[dayIndex] || null;
  }, [selectedPlan, date]);

  const workoutCompletionRate = useMemo(() => {
    if (!todayPlan || !todayPlan.exercises) return 0;
    const completed = tracking.workout_done[todayPlan.day]?.length || 0;
    return Math.round((completed / todayPlan.exercises.length) * 100);
  }, [todayPlan, tracking.workout_done]);

  const dietCompletionRate = useMemo(() => {
    if (!selectedPlan?.diet_plan) return 0;
    const totalItems = selectedPlan.diet_plan.reduce((total: number, meal: any) => total + meal.items.length, 0);
    const completedItems = Object.values(tracking.diet_consumed).reduce((total: number, items: any) => total + (items?.length || 0), 0);
    return Math.round((completedItems / totalItems) * 100);
  }, [selectedPlan, tracking.diet_consumed]);

  const toggleWorkout = (exercise: string) => {
    if (!todayPlan) return;
    const day = todayPlan.day;
    setTracking(prev => {
      const dayDone = prev.workout_done[day] || [];
      const updatedDay = dayDone.includes(exercise)
        ? dayDone.filter((e: string) => e !== exercise)
        : [...dayDone, exercise];
      return { ...prev, workout_done: { ...prev.workout_done, [day]: updatedDay } };
    });
  };

  const toggleMeal = (meal: string, item: string) => {
    setTracking(prev => {
      const mealDone = prev.diet_consumed[meal] || [];
      const updatedMeal = mealDone.includes(item)
        ? mealDone.filter((i: string) => i !== item)
        : [...mealDone, item];
      return { ...prev, diet_consumed: { ...prev.diet_consumed, [meal]: updatedMeal } };
    });
  };

  const toggleAllWorkout = (done: boolean) => {
    if (!todayPlan) return;
    const allExercises = todayPlan.exercises.map((e: any) => e.name);
    setTracking(prev => ({
      ...prev,
      workout_done: {
        ...prev.workout_done,
        [todayPlan.day]: done ? allExercises : []
      }
    }));
  };

  const toggleAllDiet = (done: boolean) => {
    if (!selectedPlan) return;
    const newDietDone: Record<string, string[]> = {};
    selectedPlan.diet_plan.forEach((meal: any) => {
      newDietDone[meal.meal] = done ? meal.items.map((i: any) => i.food) : [];
    });
    setTracking(prev => ({ ...prev, diet_consumed: newDietDone }));
  };

  const analyzeAndSave = async () => {
    if (!todayPlan || !selectedPlan || !user) return;

    const actualData = {
      workout: userWorkout.trim() ? userWorkout.trim() : tracking.workout_done[todayPlan.day] || [],
      diet: userDiet.trim() ? userDiet.trim() : tracking.diet_consumed || {}
    };

    const planData = {
      workout: todayPlan,
      diet: selectedPlan.diet_plan
    };

    try {
      const res = await fetch("/api/analyzeDay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planData, actual: actualData })
      });

      const data = await res.json();
      setAnalysis(data);

      const { data: existing } = await supabase
        .from("daily_tracking")
        .select("ai_feedback")
        .eq("user_id", user.id)
        .eq("date", date)
        .single();

      const { error } = await supabase
        .from("daily_tracking")
        .upsert(
          [
            {
              user_id: user.id,
              date,
              workout_done: tracking.workout_done,
              diet_consumed: tracking.diet_consumed,
              ai_feedback: data.status === "success" ? data : existing?.ai_feedback || {}
            }
          ],
          { onConflict: "user_id,date" }
        );

      if (error) {
        console.error("Save error:", error.message);
        alert("Failed to save!");
      } else {
        alert("Analysis & Tracking Saved!");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#F4F2F3] min-h-screen">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="text-center max-w-md mx-auto px-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-2xl shadow-lg"></div>
            </div>
            <h2 className="text-3xl font-light text-[#64766A] mb-6 tracking-tight">Login Required</h2>
            <p className="text-[#64766A]/70 font-light text-lg leading-relaxed">Please log in to track your fitness progress and view your personalized dashboard.</p>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <Loader />; // display your overall loader until data is ready
  }

  if (!selectedPlan) {
    return (
      <div className="bg-[#F4F2F3] min-h-screen">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="text-center max-w-md mx-auto px-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-2xl shadow-lg"></div>
            </div>
            <h2 className="text-3xl font-light text-[#64766A] mb-6 tracking-tight">No Plans Found</h2>
            <p className="text-[#64766A]/70 font-light text-lg leading-relaxed mb-8">Create your first fitness plan to start tracking your progress.</p>
            <button className="px-8 py-4 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-2xl text-lg font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform">
              Generate Plan
            </button>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#64766A]/10 to-[#C0A9BD]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A] font-medium"
          >
            <div className="w-2 h-2 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] rounded-full mr-3 animate-pulse"></div>
            Progress Analytics
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl font-extralight tracking-tight text-[#64766A] mb-8 leading-tight"
          >
            Track Your <span className="text-[#C0A9BD] font-light">Progress</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl text-[#64766A]/70 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Monitor your daily workouts and nutrition to stay on track with your fitness goals
          </motion.p>
        </div>
      </section>

      {/* Progress Overview Cards */}
      <section className="pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/15 to-[#94A7AE]/15 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-xl"></div>
                </div>
                <div className="text-3xl font-extralight text-[#64766A] mb-2">{workoutCompletionRate}%</div>
                <div className="text-[#64766A]/60 font-light">Workout Complete</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-[#94A7AE]/20 shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-bl from-[#94A7AE]/15 to-[#64766A]/15 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#94A7AE] to-[#64766A] rounded-xl"></div>
                </div>
                <div className="text-3xl font-extralight text-[#64766A] mb-2">{dietCompletionRate}%</div>
                <div className="text-[#64766A]/60 font-light">Diet Adherence</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-[#64766A]/20 shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#64766A]/15 to-[#C0A9BD]/15 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#64766A] to-[#C0A9BD] rounded-xl"></div>
                </div>
                <div className="text-3xl font-extralight text-[#64766A] mb-2">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="text-[#64766A]/60 font-light">Current Date</div>
              </div>
            </motion.div>
          </div>

          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl border border-[#C0A9BD]/20 shadow-xl">
              <label className="flex items-center gap-4 text-[#64766A] font-medium text-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Select Date:
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="ml-2 border-none bg-transparent text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 rounded-xl px-4 py-2 text-lg"
                />
              </label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            
            {/* Workout Section */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] border border-[#C0A9BD]/20 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] h-[600px] flex flex-col">
                {/* Elegant Background Pattern */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#C0A9BD]/15 to-[#94A7AE]/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#94A7AE]/10 to-[#64766A]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 p-10 flex flex-col h-full">
                  {/* Header - Fixed */}
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-2xl shadow-lg"></div>
                      </div>
                      <h2 className="text-3xl font-light text-[#64766A] tracking-tight">Workout Plan</h2>
                    </div>
                    {todayPlan && (
                      <label className="flex items-center gap-3 cursor-pointer bg-white/70 rounded-2xl px-4 py-2 border border-[#C0A9BD]/15 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          checked={todayPlan.exercises.every((ex: any) =>
                            tracking.workout_done[todayPlan.day]?.includes(ex.name)
                          )}
                          onChange={e => toggleAllWorkout(e.target.checked)}
                          className="w-5 h-5 text-[#64766A] rounded focus:ring-[#C0A9BD]/50"
                        />
                        <span className="text-sm font-medium text-[#64766A]">Mark all</span>
                      </label>
                    )}
                  </div>

                  {todayPlan ? (
                    <>
                      {/* Day Info - Fixed */}
                      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                        <span className="px-4 py-2 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl text-sm font-medium text-[#64766A] border border-[#C0A9BD]/30">
                          {todayPlan.day}
                        </span>
                        <div className="text-sm text-[#64766A]/60 font-light">
                          {tracking.workout_done[todayPlan.day]?.length || 0} of {todayPlan.exercises.length} completed
                        </div>
                      </div>
                      
                      {/* Scrollable Exercise List */}
                      <div 
                        className="flex-1 overflow-y-auto pr-2 space-y-4"
                        style={workoutScrollbarStyles}
                      >
                        <style jsx>{`
                          div::WebkitScrollbar {
                            width: 8px;
                          }
                          div::WebkitScrollbarTrack {
                            background: transparent;
                            border-radius: 10px;
                          }
                          div::WebkitScrollbarThumb {
                            background: rgba(192, 169, 189, 0.3);
                            border-radius: 10px;
                            border: 2px solid transparent;
                            background-clip: content-box;
                          }
                          div::WebkitScrollbarThumb:hover {
                            background: rgba(192, 169, 189, 0.5);
                          }
                        `}</style>
                        {todayPlan.exercises.map((ex: any, index: number) => (
                          <motion.label 
                            key={ex.name} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-5 p-5 bg-white/70 rounded-2xl cursor-pointer hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-[#C0A9BD]/15 backdrop-blur-sm"
                          >
                            <input
                              type="checkbox"
                              checked={tracking.workout_done[todayPlan.day]?.includes(ex.name) || false}
                              onChange={() => toggleWorkout(ex.name)}
                              className="w-6 h-6 text-[#64766A] rounded-lg focus:ring-[#C0A9BD]/50 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-[#64766A] text-lg">{ex.name}</div>
                              <div className="text-sm text-[#64766A]/60 font-light">{ex.sets} sets × {ex.reps} reps</div>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 flex-1 flex flex-col justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#64766A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-[#64766A]/70 font-light text-lg">Loading today's workout...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Diet Section */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] border border-[#94A7AE]/20 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] h-[600px] flex flex-col">
                {/* Elegant Background Pattern */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-bl from-[#94A7AE]/15 to-[#64766A]/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-[#64766A]/10 to-[#C0A9BD]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 p-10 flex flex-col h-full">
                  {/* Header - Fixed */}
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#94A7AE] to-[#64766A] rounded-2xl shadow-lg"></div>
                      </div>
                      <h2 className="text-3xl font-light text-[#64766A] tracking-tight">Diet Plan</h2>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer bg-white/70 rounded-2xl px-4 py-2 border border-[#94A7AE]/15 backdrop-blur-sm">
                      <input
                        type="checkbox"
                        checked={selectedPlan?.diet_plan.every((meal: any) =>
                          meal.items.every((i: any) => tracking.diet_consumed[meal.meal]?.includes(i.food))
                        )}
                        onChange={e => toggleAllDiet(e.target.checked)}
                        className="w-5 h-5 text-[#64766A] rounded focus:ring-[#94A7AE]/50"
                      />
                      <span className="text-sm font-medium text-[#64766A]">Mark all</span>
                    </label>
                  </div>

                  {/* Scrollable Diet List */}
                  <div 
                    className="flex-1 overflow-y-auto pr-2 space-y-8"
                    style={dietScrollbarStyles}
                  >
                    <style jsx>{`
                      div::WebkitScrollbar {
                        width: 8px;
                      }
                      div::WebkitScrollbarTrack {
                        background: transparent;
                        border-radius: 10px;
                      }
                      div::WebkitScrollbarThumb {
                        background: rgba(148, 167, 174, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: content-box;
                      }
                      div::WebkitScrollbarThumb:hover {
                        background: rgba(148, 167, 174, 0.5);
                      }
                    `}</style>
                    {selectedPlan?.diet_plan.map((meal: any, mealIndex: number) => (
                      <motion.div 
                        key={meal.meal} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mealIndex * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-2 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl text-sm font-medium text-[#64766A] border border-[#94A7AE]/30">
                            {meal.meal}
                          </span>
                          <div className="text-sm text-[#64766A]/60 font-light">
                            {tracking.diet_consumed[meal.meal]?.length || 0} of {meal.items.length} items
                          </div>
                        </div>
                        <div className="space-y-3">
                          {meal.items.map((item: any, itemIndex: number) => (
                            <motion.label 
                              key={item.food} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (mealIndex * meal.items.length + itemIndex) * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl cursor-pointer hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-[#94A7AE]/15 backdrop-blur-sm"
                            >
                              <input
                                type="checkbox"
                                checked={tracking.diet_consumed[meal.meal]?.includes(item.food) || false}
                                onChange={() => toggleMeal(meal.meal, item.food)}
                                className="w-5 h-5 text-[#64766A] rounded focus:ring-[#94A7AE]/50 flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-[#64766A]">{item.food}</div>
                                <div className="text-sm text-[#64766A]/60 font-light">{item.quantity}</div>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="group"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] border border-[#64766A]/20 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
              {/* Elegant Background Pattern */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#64766A]/15 to-[#C0A9BD]/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#C0A9BD]/10 to-[#94A7AE]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="p-10 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#64766A] to-[#C0A9BD] rounded-2xl shadow-lg"></div>
                  </div>
                  <h2 className="text-3xl font-light text-[#64766A] tracking-tight">AI Analysis & Custom Tracking</h2>
                </div>

                <p className="text-[#64766A]/70 mb-8 font-light text-lg leading-relaxed">
                  Optionally add custom activities or let our AI analyze your checklist progress
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <label className="block text-lg font-medium text-[#64766A] mb-4">Custom Workouts</label>
                    <textarea
                      value={userWorkout}
                      onChange={e => setUserWorkout(e.target.value)}
                      placeholder="Describe any additional exercises you did..."
                      className="w-full p-6 bg-white/70 border border-[#64766A]/20 rounded-2xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#64766A]/50 focus:border-[#64766A]/50 transition-all resize-none backdrop-blur-sm"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-[#64766A] mb-4">Custom Meals</label>
                    <textarea
                      value={userDiet}
                      onChange={e => setUserDiet(e.target.value)}
                      placeholder="Describe any additional meals you had..."
                      className="w-full p-6 bg-white/70 border border-[#64766A]/20 rounded-2xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#64766A]/50 focus:border-[#64766A]/50 transition-all resize-none backdrop-blur-sm"
                      rows={5}
                    />
                  </div>
                </div>

                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 p-8 bg-gradient-to-r from-[#C0A9BD]/10 to-[#94A7AE]/10 rounded-3xl border border-[#C0A9BD]/20 backdrop-blur-sm"
                  >
                    <h3 className="text-2xl font-light text-[#64766A] mb-6 tracking-tight">Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div className="text-center">
                        <div className="text-4xl font-extralight text-[#64766A] mb-2">{analysis.workout_adherence}%</div>
                        <div className="text-[#64766A]/70 font-light">Workout Adherence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-extralight text-[#64766A] mb-2">{analysis.diet_adherence}%</div>
                        <div className="text-[#64766A]/70 font-light">Diet Adherence</div>
                      </div>
                    </div>
                    <div className="p-6 bg-white/70 rounded-2xl backdrop-blur-sm border border-[#C0A9BD]/15">
                      <p className="text-[#64766A]/80 leading-relaxed text-lg font-light">{analysis.feedback}</p>
                    </div>
                  </motion.div>
                )}

                <div className="text-center">
                  <button
                    onClick={analyzeAndSave}
                    className="px-10 py-5 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-2xl text-lg font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
                  >
                    Analyze & Save Progress
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}