import { Router } from "express";
import { generateEmail, improveEmail } from "../controllers/email.controller";

const router = Router();

// POST /api/email/generate
router.post("/generate", generateEmail);

// POST /api/email/improve
router.post("/improve", improveEmail);

export default router;
