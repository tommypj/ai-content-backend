// routes/ai.keywords.ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { planGuard } from "../middleware/planGuard";
import { generateKeywords } from "../services/gemini";

const schema = z.object({ topic: z.string().min(3).max(120) });

export const router = Router();
router.post("/",
  requireAuth,
  planGuard({ feature: "keywords", daily: 100 }),
  async (req, res, next) => {
    try {
      const { topic } = schema.parse(req.body);
      const keywords = await generateKeywords({ topic });
      res.json({ keywords });
    } catch (e) { next(e); }
  }
);
