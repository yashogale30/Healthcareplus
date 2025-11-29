"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

type Answers = Record<string, string>;
type Followup = string | { question: string };

export default function DiseasePredictionPage() {
  const { user, profile, reloadProfile } = useAuth();
  const [problem, setProblem] = useState("");
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleProblemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProblem(e.target.value);
  };

  const getFollowups = async () => {
    const cost = Math.floor(500 + Math.random() * 500);
    if (!problem.trim()) {
      alert("Please enter your symptoms.");
      return;
    }
    setLoading(true);
    if (user) {
      const { data: current } = await supabase
        .from("profiles")
        .select("token_score")
        .eq("id", user.id)
        .single();

      const newScore = Math.max(0, (current?.token_score || 50000) - cost);
      await supabase
        .from("profiles")
        .update({ token_score: newScore })
        .eq("id", user.id);
      reloadProfile();
    }
    const res = await fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem }),
    });
    const data = await res.json();
    setFollowups(data.followups || []);
    setStep(2);
    setLoading(false);
  };

  const handleAnswerChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [`ans${i}`]: e.target.value });
  };

  const getPrediction = async (e: React.FormEvent) => {
    const cost = Math.floor(500 + Math.random() * 500);
    e.preventDefault();
    setLoading(true);
    if (user) {
      const { data: current } = await supabase
        .from("profiles")
        .select("token_score")
        .eq("id", user.id)
        .single();

      const newScore = Math.max(0, (current?.token_score || 50000) - cost);
      await supabase
        .from("profiles")
        .update({ token_score: newScore })
        .eq("id", user.id);
      reloadProfile();
    }
    const res = await fetch("/api/prediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem, answers }),
    });
    const data = await res.json();
    setResults(data);
    setStep(3);
    setLoading(false);
  };

  const resetPrediction = () => {
    setStep(1);
    setProblem("");
    setFollowups([]);
    setAnswers({});
    setResults(null);
  };

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
            Health Assessment
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Disease <span className="text-[#C0A9BD]">Prediction</span>
          </h1>
          
          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Get personalized health insights based on your symptoms using advanced AI technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Step 1: Initial Symptoms */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    {/* <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🩺</span>
                    </div> */}
                    <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Describe Your Symptoms</h2>
                    <p className="text-[#64766A]/70">Tell us about how you're feeling and what symptoms you're experiencing.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-[#64766A]" htmlFor="problem">
                      What symptoms are you experiencing?
                    </label>
                    <textarea
                      id="problem"
                      rows={5}
                      placeholder="Please describe your symptoms in detail (e.g., headache, fever, nausea, etc.)"
                      value={problem}
                      onChange={handleProblemChange}
                      className="w-full p-4 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={getFollowups}
                    disabled={loading || !problem.trim()}
                    className="w-full px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      "Continue to Assessment"
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Follow-up Questions */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  onSubmit={getPrediction}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">❓</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Additional Questions</h2>
                    <p className="text-[#64766A]/70">Please answer these questions to help us provide better insights.</p>
                  </div>

                  <div className="space-y-6">
                    {followups.map((question, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-[#64766A]" htmlFor={`ans${i}`}>
                          {typeof question === "string" ? question : question.question ?? ""}
                        </label>
                        <input
                          id={`ans${i}`}
                          name={`ans${i}`}
                          value={answers[`ans${i}`] || ""}
                          onChange={(e) => handleAnswerChange(i, e)}
                          className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                          required
                        />
                      </motion.div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-[#C0A9BD] text-white rounded-full text-lg font-medium hover:bg-[#C0A9BD]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting Prediction...
                      </span>
                    ) : (
                      "Get Health Assessment"
                    )}
                  </button>
                </motion.form>
              )}

              {/* Step 3: Results */}
              {step === 3 && results && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Health Assessment Results</h2>
                    <p className="text-[#64766A]/70">Based on your symptoms, here's what our AI analysis suggests:</p>
                  </div>

                  <div className="space-y-4">
                    {results.conditions && (
                      <div className="bg-gradient-to-br from-[#C0A9BD]/10 to-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#64766A] mb-3 flex items-center gap-2">
                          <span className="text-xl">🔍</span>
                          Possible Conditions
                        </h3>
                        <p className="text-[#64766A]/80">{results.conditions.join(", ")}</p>
                      </div>
                    )}

                    {results.medicines && (
                      <div className="bg-gradient-to-br from-[#94A7AE]/10 to-[#64766A]/10 border border-[#94A7AE]/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#64766A] mb-3 flex items-center gap-2">
                          <span className="text-xl">💊</span>
                          Suggested Medicines
                        </h3>
                        <p className="text-[#64766A]/80">{results.medicines.join(", ")}</p>
                      </div>
                    )}

                    {results.care_tips && (
                      <div className="bg-gradient-to-br from-[#64766A]/10 to-[#C0A9BD]/10 border border-[#64766A]/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#64766A] mb-3 flex items-center gap-2">
                          <span className="text-xl">💡</span>
                          Care Tips
                        </h3>
                        <p className="text-[#64766A]/80">{results.care_tips.join(", ")}</p>
                      </div>
                    )}

                    {results.see_doctor_if && (
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <span className="text-xl">⚠️</span>
                          See Doctor If
                        </h3>
                        <p className="text-red-600">{results.see_doctor_if.join(", ")}</p>
                      </div>
                    )}

                    {results.disclaimer && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                          <span className="text-xl">⚖️</span>
                          Important Disclaimer
                        </h3>
                        <p className="text-yellow-700 text-sm">{results.disclaimer}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={resetPrediction}
                    className="w-full px-8 py-4 bg-white/70 backdrop-blur-sm text-[#64766A] rounded-full text-lg font-medium hover:bg-white/90 transition-all duration-300 border border-[#C0A9BD]/30"
                  >
                    🔄 Start New Assessment
                  </button>
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
