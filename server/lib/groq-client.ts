import Groq from "groq-sdk";

// Initialize Groq client with API key from environment
// Using Groq's free tier: 14,400 requests/day, fast inference with Llama models
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model: Llama 3.3 70B - Meta's latest flagship model (October 2025)
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Backup model: Llama 3.1 8B - faster for simpler tasks
export const FAST_MODEL = "llama-3.1-8b-instant";
