import express from "express";
import { getFollowups } from "../controllers/followupsController.js";

const router = express.Router();

// POST /api/followups
router.post("/", getFollowups);

export default router;
