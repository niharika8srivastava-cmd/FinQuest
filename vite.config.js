import { defineConfig, loadEnv } from "vite";
import { replyFromFinBuddy } from "./server/finbuddy-core.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-2.0-flash";
  return {
    base: "./",
    plugins: [{
      name: "finbuddy-gemini-dev-api",
      configureServer(server) {
        server.middlewares.use("/api/finbuddy", async (req, res) => {
          console.log("[FinBuddy API] request", { method: req.method, hasApiKey: Boolean(apiKey), model });
          if (req.method !== "POST") { res.statusCode = 405; console.warn("[FinBuddy API] method-not-allowed"); return res.end(JSON.stringify({ error: "Method not allowed" })); }
          let raw = "";
          for await (const chunk of req) raw += chunk;
          let body = {};
          try { body = JSON.parse(raw); } catch (error) { console.warn("[FinBuddy API] invalid-json"); }
          try {
            const result = await replyFromFinBuddy({ message: body.message, history: body.history, apiKey, model });
            console.log("[FinBuddy API] response", { status: 200, allowed: result.allowed });
            res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify(result));
          } catch (error) {
            res.statusCode = error.code === "empty-message" ? 400 : error.code === "not-configured" ? 503 : 502;
            console.error("[FinBuddy API] error", { status: res.statusCode, code: error.code || "unknown", message: error.message || "unknown error" });
            res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify({ error: "FinBuddy is temporarily unavailable. Please try again shortly." }));
          }
        });
      }
    }]
  };
});
