import { replyFromFinBuddy } from "../server/finbuddy-core.js";

export default async function handler(req, res) {
  console.log("[FinBuddy API] request", { method: req.method, hasApiKey: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || "default" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const result = await replyFromFinBuddy({ message: req.body?.message, history: req.body?.history, apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL });
    console.log("[FinBuddy API] response", { status: 200, allowed: result.allowed });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.code === "empty-message" ? 400 : error.code === "not-configured" ? 503 : 502;
    console.error("[FinBuddy API] error", { status, code: error.code || "unknown", message: error.message || "unknown error" });
    return res.status(status).json({ error: "FinBuddy is temporarily unavailable. Please try again shortly." });
  }
}
