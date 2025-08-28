import { callGemini } from "../services/geminiService.js";
import { filterSafety } from "../utils/safety.js";

export const getPrediction = async (req, res) => {
    const { problem, answers } = req.body;
    if (!problem || !answers) return res.status(400).json({ error: "Missing data" });

    const prompt = `
    The user reported: "${problem}".
    Follow-up answers: ${JSON.stringify(answers)}.
    
    Suggest:
    1. Likely conditions (max 3)
    2. Safe over-the-counter medicines
    3. Home care tips
    4. Red-flag symptoms requiring doctor

    Return as JSON:
    {
        "conditions": [...],
        "medicines": [...],
        "care_tips": [...],
        "see_doctor_if": [...]
    }
    `;

    try {
        let response = await callGemini(prompt);
        response = filterSafety(response); // ensure no prescription drugs or unsafe advice
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Prediction failed" });
    }
};
