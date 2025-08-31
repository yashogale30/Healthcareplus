"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar"; // Make sure this import is correct

type Answers = Record<string, string>;
type Followup = string | { question: string };

export default function DiseasePredictionPage() {
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
    if (!problem.trim()) {
      alert("Please enter your symptoms.");
      return;
    }
    setLoading(true);
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
    e.preventDefault();
    setLoading(true);
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

  return (
    <div>
      <Navbar />
      <div className="disease-bg" style={{ paddingTop: "85px" }}>
        <div className="card-main">
          <h2 className="title">🩺 Disease Prediction Tool</h2>
          <p className="subtitle">AI-powered symptom checker</p>
          {step === 1 && (
            <div className="fadein">
              <label className="input-label" htmlFor="problem">Describe your symptoms:</label>
              <textarea
                id="problem"
                rows={4}
                placeholder="Describe your symptoms..."
                value={problem}
                onChange={handleProblemChange}
                className="text-input"
              />
              <button className="primary-btn" onClick={getFollowups} disabled={loading}>
                {loading ? "Please wait..." : "Next"}
              </button>
            </div>
          )}
          {step === 2 && (
            <form className="fadein" onSubmit={getPrediction}>
              {followups.map((question, i) => (
                <div key={i} className="form-group">
                  <label className="input-label" htmlFor={`ans${i}`}>
                    {typeof question === "string" ? question : question.question ?? ""}
                  </label>
                  <input
                    id={`ans${i}`}
                    name={`ans${i}`}
                    value={answers[`ans${i}`] || ""}
                    onChange={(e) => handleAnswerChange(i, e)}
                    className="text-input"
                    required
                  />
                </div>
              ))}
              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Get Prediction"}
              </button>
            </form>
          )}
          {step === 3 && results && (
            <div id="results" className="fadein">
              <div className="card-output"><strong>Possible Conditions:</strong> {results.conditions?.join(", ")}</div>
              <div className="card-output"><strong>Medicines:</strong> {results.medicines?.join(", ")}</div>
              <div className="card-output"><strong>Care Tips:</strong> {results.care_tips?.join(", ")}</div>
              <div className="card-output"><strong>See Doctor If:</strong> {results.see_doctor_if?.join(", ")}</div>
              <div className="card-output"><strong>Disclaimer:</strong> {results.disclaimer}</div>
              <button
                className="secondary-btn"
                onClick={() => {
                  setStep(1);
                  setProblem("");
                  setFollowups([]);
                  setAnswers({});
                  setResults(null);
                }}>
                🔄 Do Another Prediction
              </button>
            </div>
          )}
        </div>
        <style>{`
          .disease-bg {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card-main {
            background: #fff;
            padding: 2.5rem 2rem 2rem 2rem;
            border-radius: 18px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.07);
            width: 100%;
            max-width: 700px;
          }
          .title {
            margin-bottom: 0.2em;
            text-align: center;
          }
          .subtitle {
            text-align: center;
            margin-bottom: 1.7em;
            color: #555a;
            font-size: 1.02em;
            letter-spacing: 0.01em;
          }
          .text-input {
            width: 100%;
            padding: 9px 12px;
            margin: 6px 0 16px 0;
            font-size: 1rem;
            border: 1.3px solid #cfe1ee;
            border-radius: 7px;
            background: #f7fbfc;
            color: #222;
            transition: border 0.2s;
          }
          .text-input:focus {
            outline: none;
            border-color: #5fc6ff;
          }
          .input-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #374151;
          }
          .form-group {
            margin-bottom: 1.1rem;
          }
          .primary-btn, .secondary-btn {
            padding: 10px 24px;
            border-radius: 7px;
            font-size: 1rem;
            border: none;
            cursor: pointer;
          }
          .primary-btn {
            background: linear-gradient(90deg, #36d1c4, #5fc6ff);
            color: white;
            font-weight: 600;
            width: 100%;
            margin-top: 0.2em;
            margin-bottom: 0.3em;
            box-shadow: 0 2px 8px #8fd6ff33;
            transition: background 0.2s, box-shadow 0.2s;
          }
          .primary-btn:disabled {
            background: #c3cfe255;
            cursor: not-allowed;
          }
          .secondary-btn {
            background: #f5f7fa;
            color: #575a63;
            border: 1.2px solid #cfe1ee;
            margin-top: 1em;
            margin-left: auto;
            margin-right: auto;
            display: block;
            width: 100%;
            font-weight: 500;
          }
          .card-output {
            background: #f7fbfc;
            border-left: 5px solid #5fc6ff;
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 1.07em;
          }
          .fadein {
            animation: fadein 0.45s;
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(12px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>
      </div>
    </div>
  );
}
