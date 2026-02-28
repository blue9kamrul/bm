import express from "express";
import { getSocialProfile } from "../../controllers/open-apis/controllers/userProfile.controller.js";
const router = express.Router();

// Public endpoint - no authentication required
// This allows banks/platforms to query by user ID or email
router.get("/profile/:identifier", getSocialProfile);

export default router;