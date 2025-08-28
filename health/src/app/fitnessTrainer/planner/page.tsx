"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";

export default function Page2() {
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
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output);
      } else {
        setErrorMsg(data.error || "❌ Error generating plan.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const implementPlan = async () => {
    if (!output) return;
    try {
      const res = await fetch("/api/savePlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(output),
      });
      if (res.ok) router.push("/page1");
    } catch {
      setErrorMsg("Something went wrong while saving.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-6 py-20 space-y-12"
      >
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            AI Fitness & Diet Planner
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your details and get a personalized fitness & diet plan powered by AI.
          </p>
        </div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-800">Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />

                <Select onValueChange={(val) => handleChange("gender", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Weight (kg)"
                  value={form.weightKg}
                  onChange={(e) => handleChange("weightKg", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Height (cm)"
                  value={form.heightCm}
                  onChange={(e) => handleChange("heightCm", e.target.value)}
                />

                <Select onValueChange={(val) => handleChange("activityLevel", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Activity Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly active">Lightly active</SelectItem>
                    <SelectItem value="Moderately active">Moderately active</SelectItem>
                    <SelectItem value="Very active">Very active</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Fitness Goal"
                  value={form.goal}
                  onChange={(e) => handleChange("goal", e.target.value)}
                  className="md:col-span-2"
                />
                <Input
                  placeholder="Other Information"
                  value={form.oi}
                  onChange={(e) => handleChange("oi", e.target.value)}
                  className="md:col-span-2"
                />

                <Select onValueChange={(val) => handleChange("dietPreference", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Diet Preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="Keto">Keto</SelectItem>
                    <SelectItem value="Paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={generatePlan}
                  disabled={loading}
                  className="px-8 py-3 text-lg font-semibold text-white rounded-xl shadow-md bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition"
                >
                  {loading ? "Generating..." : "Generate My Plan"}
                </Button>
              </div>
              {errorMsg && <p className="text-red-500 text-center mt-3">{errorMsg}</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* OUTPUT */}
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8"
          >
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-800">🏋️ Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {output.workoutPlan.map((day, i) => (
                  <div key={i} className="mb-6">
                    <p className="font-semibold text-lg text-gray-900 mb-2">{day.day}</p>
                    <ul className="list-disc ml-6 text-gray-700">
                      {day.exercises.map((ex: any, j: number) => (
                        <li key={j}>
                          <span className="font-medium text-gray-900">{ex.name}</span> — {ex.sets} sets × {ex.reps} reps
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-800">🥗 Diet Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {output.dietPlan.map((meal, i) => (
                  <div key={i} className="mb-6">
                    <p className="font-semibold text-lg text-gray-900 mb-2">{meal.meal}</p>
                    <ul className="list-disc ml-6 text-gray-700">
                      {meal.items.map((item: any, j: number) => (
                        <li key={j}>
                          <span className="font-medium text-gray-900">{item.food}</span> — {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={implementPlan}
                className="px-8 py-3 text-lg font-semibold text-white rounded-xl shadow-md bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 transition"
              >
                Implement My Plan
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}