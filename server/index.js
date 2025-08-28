import 'dotenv/config';  // This imports and runs dotenv.config() immediately

import express from "express";
import cors from "cors";
import followupRoutes from "./routes/followups.js";
import predictionRoutes from "./routes/prediction.js";

const app = express();
app.use(express.json());

app.use(cors());

// Routes
app.use("/api/followups", followupRoutes);
app.use("/api/prediction", predictionRoutes);

// Health check
app.get("/", (req, res) => res.send("Disease Prediction API Running"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
