import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const callGemini = async (prompt) => {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const response = await axios.post(GEMINI_URL, payload);

    let output = response.data.candidates[0]?.content?.parts[0]?.text || "";

    // Strip markdown code fences if present
    output = output
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(output);
    } catch {
      return [output]; // fallback if not valid JSON
    }
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return null;
  }
};
