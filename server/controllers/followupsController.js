import { callGemini } from "../services/geminiService.js";

export const getFollowups = async (req, res) => {
    const { problem } = req.body;
    if (!problem) return res.status(400).json({ error: "Symptom description required" });

    const prompt = `
    A user reports: "${problem}".
    Generate 5–6 short follow-up questions to clarify their symptoms.
    Return ONLY a JSON array of questions, with no markdown or explanation.
`;


    try {
        const followups = await callGemini(prompt);
        res.json({ followups });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get follow-ups" });
    }
};
