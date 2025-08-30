"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/navbar";
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

//phase 1(PHQ-2)
const phase1Questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
];

//phase 2(PHQ-9)
const phase2Questions = [
  "Trouble falling, or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or feeling that you are a failure or that you have let yourself or your family down?",
  "Trouble concentrating on things, such as reading the newspaper or watching television?",
  "Are you moving or speaking slower than usual? Or the opposite - neing too fidgety or restless?",
  "Thoughts that you would be better off dead or of hurting yourself in some way?"
];

const answerOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export default function page() {
  const { user } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestCategory, setLatestCategory] = useState<string>("");
  const currentQuestions = phase === 1 ? phase1Questions : phase === 2 ? phase2Questions : [];
  // useEffect(() => {
  //   if (!user) {
  //     router.push("/");
  //   }
  // }, [user]);
  // if (!user) return <p>Loading...</p>;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    //if more questions left in this phase
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      //phase transition
      if (phase === 1) {
        const screeningScore = newAnswers.reduce((a, b) => a + b, 0);
        if (screeningScore >= 2) {
          //high enough. go to Phase 2
          setPhase(2);
          setCurrentIndex(0);
          setAnswers([]);
        } else {
          //low risk. finish early
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

    if(phase === 1) {
      // PHQ-2 interpretation
      tool = "PHQ-2";
      if (score <= 2) category = "Minimal / Low risk";
      else if (score <= 4) category = "Moderate";
      else category = "High risk";
    } else if (phase === 2) {
      // PHQ-9 interpretation
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
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Mental Health Tracker</h1>
        {/* Wuestionnaire */}
        {latestScore === null && (
          <section className="mb-8">
            <div className="bg-gray-100 p-4 rounded-lg mb-3">
              <p className="font-medium">
                {currentQuestions[currentIndex]}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {answerOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:cursor-pointer transition"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        )}
        
        {/* Latest Score */}
        {latestScore !== null && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Latest Assessment</h2>
            <p>
              Your latest mental health score is <strong>{latestScore}</strong> (
              {latestCategory})
            </p>
            <p className="mt-2">
              Recommendation:{" "}
              {latestCategory === "Poor"
                ? "Consider meditation, relaxation exercises, or consult a professional."
                : latestCategory === "Moderate"
                ? "Maintain daily check-ins and stress management techniques."
                : "Keep up the good mental habits!"}
            </p>
            <button
              onClick={() => {
                setLatestScore(null);
                setLatestCategory("");
                setPhase(1);
                setCurrentIndex(0);
                setAnswers([]);
                if (!user) localStorage.removeItem("guestMentalHealthResult");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:cursor-pointer transition"
            >
              Retake Assessment
            </button>
          </section>
        )}

        {/* History only for logged in */}
        {user && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Historical Trends</h2>
            {logs.length === 0 ? (
              <p>No records yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={logs} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="score" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(ts) => `Date: ${new Date(ts).toLocaleString()}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>
        )}
        {!user && (
          <p className="mt-6 text-center text-gray-500">
            Log in to save your progress and view historical trends.
          </p>
        )}
        {/* Attribution footer */}
        <footer className="mt-6 text-xs text-gray-400 text-center">
          *This screening uses items from PHQ-2 and PHQ-9 questionnaires, which are in the public domain.<br />
          This tool is not a diagnosis, but a self-check aid.
          Consult a professional for medical advice.
        </footer>
      </div>
    </div>
  );
}