import express from "express";
import { getPrediction } from "../controllers/predictionController.js";

const router = express.Router();

// POST /api/prediction
router.post("/", getPrediction);

export default router;
