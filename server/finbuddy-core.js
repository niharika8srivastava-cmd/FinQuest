import { GoogleGenAI } from "@google/genai";

export const FINBUDDY_SYSTEM_INSTRUCTION = "You are FinBuddy, a beginner-friendly financial education assistant. Answer ONLY finance, banking and financial-literacy questions. Explain concepts simply with practical examples. Prefer Indian context when relevant. Do not fabricate current rates, regulations, taxes, market data or policies. Do not guarantee investment returns or provide definitive personalized investment advice. If current information is required but unavailable, tell the user to verify it from an official source.";

const SCOPE_SYSTEM_INSTRUCTION = "You are FinBuddy's strict scope checker. Decide whether the user's latest request is about finance, banking, financial literacy, investing, economics, budgeting, UPI, cards, credit scores, loans, EMI, FD/RD, mutual funds, SIP, stocks, bonds, insurance, taxes, inflation, scams, or financial security. Allow a short follow-up only when the supplied conversation context clearly shows it is asking about a permitted finance discussion. Do not allow unrelated programming, schoolwork, entertainment, games, celebrities, or general questions. A question about Python used specifically for financial analysis is allowed. Return JSON only: {\"allowed\": boolean, \"category\": string, \"confidence\": number}.";

export const FINBUDDY_REFUSAL = "I'm FinBuddy, your finance and banking assistant. I can help with banking, saving, investing, loans, credit, insurance, taxes and financial literacy, but not unrelated topics.";

function parseScope(text) { try { const value = JSON.parse(text || "{}"); return { allowed: value.allowed === true, category: typeof value.category === "string" ? value.category : "general", confidence: Number(value.confidence) || 0 }; } catch (error) { return { allowed: false, category: "general", confidence: 0 }; } }
function cleanHistory(history) { return (Array.isArray(history) ? history : []).slice(-6).map((item) => ({ role: item.role === "assistant" ? "FinBuddy" : "Learner", text: String(item.text || "").slice(0, 1000) })).filter((item) => item.text); }
function withTimeout(promise, ms) { return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]); }
function debugLog(event, details) { console.log("[FinBuddy]", event, details || ""); }
function errorDetails(error) { return { code: error?.code || "unknown", name: error?.name || "Error", message: String(error?.message || "unknown error").slice(0, 200) }; }

export async function replyFromFinBuddy({ message, history, apiKey, model = "gemini-2.0-flash" }) {
  const startedAt = Date.now();
  debugLog("request", { model, hasApiKey: Boolean(apiKey), historyItems: Array.isArray(history) ? history.length : 0 });
  if (!apiKey) { const error = new Error("not-configured"); error.code = "not-configured"; debugLog("configuration-error", errorDetails(error)); throw error; }
  const question = typeof message === "string" ? message.trim().slice(0, 3000) : "";
  if (!question) { const error = new Error("empty-message"); error.code = "empty-message"; debugLog("validation-error", errorDetails(error)); throw error; }
  const ai = new GoogleGenAI({ apiKey });
  const context = cleanHistory(history).map((item) => item.role + ": " + item.text).join("\n");
  let scopeResponse;
  try {
    scopeResponse = await withTimeout(ai.models.generateContent({ model, contents: "Recent conversation (context only):\n" + (context || "None") + "\n\nLatest user request: " + question, config: { systemInstruction: SCOPE_SYSTEM_INSTRUCTION, responseMimeType: "application/json", temperature: 0, maxOutputTokens: 100 } }), 12000);
  } catch (error) { const scopedError = new Error("scope-unavailable"); scopedError.code = "scope-unavailable"; debugLog("scope-error", Object.assign(errorDetails(scopedError), { provider: errorDetails(error), elapsedMs: Date.now() - startedAt })); throw scopedError; }
  const scope = parseScope(scopeResponse.text);
  debugLog("scope-result", { allowed: scope.allowed, category: scope.category, confidence: scope.confidence });
  if (!scope.allowed) { debugLog("request-complete", { allowed: false, elapsedMs: Date.now() - startedAt }); return { answer: FINBUDDY_REFUSAL, allowed: false, category: scope.category }; }
  try {
    const answerResponse = await withTimeout(ai.models.generateContent({ model, contents: "Recent conversation:\n" + (context || "None") + "\n\nLearner's latest finance question: " + question, config: { systemInstruction: FINBUDDY_SYSTEM_INSTRUCTION, temperature: 0.25, maxOutputTokens: 420 } }), 18000);
    const answer = (answerResponse.text || "").trim();
    if (!answer) { const error = new Error("empty-response"); error.code = "empty-response"; throw error; }
    debugLog("request-complete", { allowed: true, answerLength: answer.length, elapsedMs: Date.now() - startedAt });
    return { answer, allowed: true, category: scope.category };
  } catch (error) { const answerError = new Error("answer-unavailable"); answerError.code = "answer-unavailable"; debugLog("answer-error", Object.assign(errorDetails(answerError), { provider: errorDetails(error), elapsedMs: Date.now() - startedAt })); throw answerError; }
}
