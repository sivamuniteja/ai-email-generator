import { Request, Response } from "express";
import { z } from "zod";
import { streamEmailWithGroq, streamEmailImprovementWithGroq } from "../services/ai.service";

const generateSchema = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  sender: z.string().optional(),
  subject: z.string().optional(),
  context: z.string().min(10),
  tone: z.string().min(1),
  length: z.string().min(1),
  language: z.string().default("English"),
});

export const generateEmail = async (req: Request, res: Response) => {
  try {
    const data = generateSchema.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await streamEmailWithGroq(data, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request payload", details: error.errors });
    } else {
      console.error("Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate email" });
    }
  }
};

const improveSchema = z.object({
  currentEmail: z.string().min(1),
  action: z.enum(["shorten", "expand", "professional", "friendly"]),
});

export const improveEmail = async (req: Request, res: Response) => {
  try {
    const data = improveSchema.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await streamEmailImprovementWithGroq(data.currentEmail, data.action, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request payload", details: error.errors });
    } else {
      console.error("Improvement Error:", error);
      res.status(500).json({ error: error.message || "Failed to improve email" });
    }
  }
};
