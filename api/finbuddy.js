import { replyFromFinBuddy } from "../server/finbuddy-core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const result = await replyFromFinBuddy({ message: req.body?.message, history: req.body?.history, apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.code === "empty-message" ? 400 : error.code === "not-configured" ? 503 : 502;
    return res.status(status).json({ error: "FinBuddy is temporarily unavailable. Please try again shortly." });
  }
}
