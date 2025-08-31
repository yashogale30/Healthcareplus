"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Log {
  id: number;
  score: number;
  category: string;
  created_at: string;
}

// Phase 1 (PHQ-2)
const phase1Questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
];

// Phase 2 (PHQ-9)
const phase2Questions = [
  "Trouble falling, or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or feeling that you are a failure or that you have let yourself or your family down?",
  "Trouble concentrating on things, such as reading the newspaper or watching television?",
  "Are you moving or speaking slower than usual? Or the opposite - being too fidgety or restless?",
  "Thoughts that you would be better off dead or of hurting yourself in some way?"
];

const answerOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export default function MentalHealthPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestCategory, setLatestCategory] = useState<string>("");
  
  const currentQuestions = phase === 1 ? phase1Questions : phase === 2 ? phase2Questions : [];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      if (phase === 1) {
        const screeningScore = newAnswers.reduce((a, b) => a + b, 0);
        if (screeningScore >= 2) {
          setPhase(2);
          setCurrentIndex(0);
          setAnswers([]);
        } else {
          finalize(newAnswers);
        }
      } else if (phase === 2) {
        finalize(newAnswers);
      }
    }
  };

  const finalize = async (finalAnswers: number[]) => {
    let score = finalAnswers.reduce((sum, v) => sum + v, 0);
    let category = "";
    let tool = "";

    if (phase === 1) {
      tool = "PHQ-2";
      if (score <= 2) category = "Minimal / Low risk";
      else if (score <= 4) category = "Moderate";
      else category = "High risk";
    } else if (phase === 2) {
      tool = "PHQ-9";
      if (score <= 4) category = "Minimal";
      else if (score <= 9) category = "Mild";
      else if (score <= 14) category = "Moderate";
      else if (score <= 19) category = "Moderately severe";
      else category = "Severe";
    }

    setLatestScore(score);
    setLatestCategory(category);

    if (user) {
      const { error } = await supabase.from("mental_health_logs").insert([
        {
          user_id: user.id,
          score,
          category,
        },
      ]);
      if (error) {
        console.error("Error saving mental health log:", error.message);
      } else {
        fetchLogs();
      }
    } else {
      const guestResult = { score, category, timestamp: new Date().toISOString() };
      localStorage.setItem("guestMentalHealthResult", JSON.stringify(guestResult));
    }
  };

  const fetchLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("mental_health_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching logs:", error.message);
    } else if (data) {
      setLogs(data);
      if (data.length > 0) {
        const last = data[data.length - 1];
        setLatestScore(last.score);
        setLatestCategory(last.category);
      }
    }
  };

  const retakeAssessment = () => {
    setLatestScore(null);
    setLatestCategory("");
    setPhase(1);
    setCurrentIndex(0);
    setAnswers([]);
    if (!user) localStorage.removeItem("guestMentalHealthResult");
  };

  const getRecommendation = (category: string) => {
    switch (category.toLowerCase()) {
      case "severe":
      case "moderately severe":
        return "Please consider seeking professional help immediately. Your mental health is important.";
      case "moderate":
        return "Consider meditation, relaxation exercises, or consult a mental health professional.";
      case "mild":
        return "Maintain daily check-ins and stress management techniques. Consider mindfulness practices.";
      default:
        return "Keep up the good mental health habits! Continue monitoring your wellbeing.";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "severe":
        return "from-red-500 to-red-600";
      case "moderately severe":
        return "from-orange-500 to-red-500";
      case "moderate":
        return "from-yellow-500 to-orange-500";
      case "mild":
        return "from-blue-400 to-blue-500";
      default:
        return "from-green-400 to-green-500";
    }
  };

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("guestMentalHealthResult");
      if (saved) {
        const { score, category } = JSON.parse(saved);
        setLatestScore(score);
        setLatestCategory(category);
      }
    } else {
      fetchLogs();
    }
  }, [user]);

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
            Mental Health Assessment Tool
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Mental <span className="text-[#C0A9BD]">Wellness</span>
          </h1>
          
          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Monitor and track your mental health with our evidence-based assessment tools.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Questionnaire Section */}
          <AnimatePresence mode="wait">
            {latestScore === null && (
              <motion.div
                key="questionnaire"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Mental Health Assessment</h2>
                  <p className="text-[#64766A]/70">
                    Phase {phase} - Question {currentIndex + 1} of {currentQuestions.length}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="bg-gradient-to-br from-[#94A7AE]/10 to-[#64766A]/10 border border-[#94A7AE]/20 rounded-2xl p-6 mb-6">
                    <p className="text-lg font-medium text-[#64766A] text-center">
                      Over the last 2 weeks, how often have you been bothered by: {currentQuestions[currentIndex]}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {answerOptions.map((opt, index) => (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswer(opt.value)}
                        className="p-4 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] hover:bg-[#C0A9BD]/10 hover:border-[#C0A9BD]/50 transition-all duration-300 text-left font-medium"
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#94A7AE]/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            )}

            {/* Results Section */}
            {latestScore !== null && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Assessment Results</h2>
                    <p className="text-[#64766A]/70">Your latest mental health evaluation</p>
                  </div>

                  <div className="space-y-6">
                    <div className={`bg-gradient-to-r ${getCategoryColor(latestCategory)} rounded-2xl p-6 text-white text-center`}>
                      <div className="text-3xl font-bold mb-2">Score: {latestScore}</div>
                      <div className="text-xl font-medium">{latestCategory}</div>
                    </div>

                    <div className="bg-gradient-to-br from-[#C0A9BD]/10 to-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-[#64766A] mb-3 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Recommendation
                      </h3>
                      <p className="text-[#64766A]/80">{getRecommendation(latestCategory)}</p>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={retakeAssessment}
                        className="px-8 py-4 bg-[#C0A9BD] text-white rounded-full text-lg font-medium hover:bg-[#C0A9BD]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        🔄 Retake Assessment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Historical Trends for logged-in users */}
                {user && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📈</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Historical Trends</h2>
                      <p className="text-[#64766A]/70">Track your mental health progress over time</p>
                    </div>

                    {logs.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-[#64766A]/60">No historical data available yet. Take more assessments to see your progress.</p>
                      </div>
                    ) : (
                      <div className="bg-white/60 rounded-2xl p-6 border border-[#C0A9BD]/20">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={logs} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#C0A9BD" 
                              strokeWidth={3}
                              dot={{ fill: "#64766A", strokeWidth: 2, r: 6 }}
                            />
                            <CartesianGrid stroke="#94A7AE" strokeDasharray="5 5" opacity={0.3} />
                            <XAxis
                              dataKey="created_at"
                              tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                              stroke="#64766A"
                            />
                            <YAxis stroke="#64766A" />
                            <Tooltip
                              labelFormatter={(ts) => `Date: ${new Date(ts).toLocaleString()}`}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(192, 169, 189, 0.3)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)'
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* Guest user message */}
                {!user && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center">
                    <p className="text-blue-700 font-medium">
                      📝 Log in to save your progress and view historical trends of your mental health assessments.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
              <span className="text-xl">⚖️</span>
              Important Disclaimer
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>*This screening uses items from PHQ-2 and PHQ-9 questionnaires, which are in the public domain.</p>
              <p>This tool is not a diagnosis, but a self-check aid. Consult a professional for medical advice.</p>
              <p>If you're experiencing thoughts of self-harm, please seek immediate professional help or contact a crisis helpline.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
