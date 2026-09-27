// API Configuration
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const config = {
  apiUrl: isLocalHost ? "http://localhost:5000/api" : "https://apiv1.kunalpatil.me/api",
  codeExecutionApiUrl: "http://3.110.206.43",
  codeExecutionAuthToken: "kunal",
  
  // AI Configuration
  openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || "",
  mem0ApiKey: import.meta.env.VITE_MEM0_API_KEY || "",
  defaultModel: import.meta.env.VITE_DEFAULT_AI_MODEL || "llama-3.1-70b-versatile",
  
  // Available AI models for diary completion
  aiModels: [
    { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B (Groq)", provider: "Groq" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Groq)", provider: "Groq" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (Groq)", provider: "Groq" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B (Groq)", provider: "Groq" },
  ],
};
