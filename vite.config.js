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
          if (req.method !== "POST") { res.statusCode = 405; return res.end(JSON.stringify({ error: "Method not allowed" })); }
          let raw = "";
          for await (const chunk of req) raw += chunk;
          let body = {};
          try { body = JSON.parse(raw); } catch (error) {}
          try {
            const result = await replyFromFinBuddy({ message: body.message, history: body.history, apiKey, model });
            res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify(result));
          } catch (error) {
            res.statusCode = error.code === "empty-message" ? 400 : error.code === "not-configured" ? 503 : 502;
            res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify({ error: "FinBuddy is temporarily unavailable. Please try again shortly." }));
          }
        });
      }
    }]
  };
});
