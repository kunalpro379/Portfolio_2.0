import { config } from "@/config/config";

// Simple in-memory cache for AI completions
const completionCache = new Map<string, string>();

interface AICompletionOptions {
  text: string;
  context?: string;
  model?: string;
  useCache?: boolean;
}

interface Mem0Memory {
  role: string;
  content: string;
}

export class AIService {
  private static instance: AIService;
  private mem0Enabled: boolean = false;

  private constructor() {
    this.mem0Enabled = !!config.mem0ApiKey;
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Get AI completion for partial text
  async getCompletion(options: AICompletionOptions): Promise<string> {
    const { text, context = "", model = config.defaultModel, useCache = true } = options;

    console.log("aiService.getCompletion called:", { text, model, hasApiKey: !!config.openRouterApiKey, apiKeyLength: config.openRouterApiKey?.length });

    // Check cache first
    const cacheKey = `${text}-${model}`;
    if (useCache && completionCache.has(cacheKey)) {
      console.log("Returning cached completion");
      return completionCache.get(cacheKey)!;
    }

    try {
      console.log("Making local AI completion request...");
      const response = await fetch(`${config.apiUrl}/premium-notes/ai/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          text: text,
          context: context
        })
      });

      console.log("Local API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Local API error:", { status: response.status, error: errorText });
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Local response data:", data);
      
      const completion = data.completion || "";

      // Cache the result
      if (useCache && completion) {
        completionCache.set(cacheKey, completion);
      }

      return completion;
    } catch (error) {
      console.error("AI completion error:", error);
      return "";
    }
  }

  // Store conversation in Mem0
  async storeMemory(messages: Mem0Memory[], userId: string = "diary-user"): Promise<void> {
    if (!this.mem0Enabled) {
      console.warn("Mem0 is not configured");
      return;
    }

    try {
      const response = await fetch("https://api.mem0.ai/v1/memories/", {
        method: "POST",
        headers: {
          "Authorization": `Token ${config.mem0ApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messages,
          user_id: userId,
          metadata: {
            source: "diary",
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Mem0 API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Mem0 memory storage error:", error);
    }
  }

  // Search memories from Mem0
  async searchMemories(query: string, userId: string = "diary-user"): Promise<string[]> {
    if (!this.mem0Enabled) {
      return [];
    }

    try {
      const response = await fetch(`https://api.mem0.ai/v1/memories/search/?query=${encodeURIComponent(query)}&user_id=${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${config.mem0ApiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Mem0 search error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((memory: any) => memory.memory);
    } catch (error) {
      console.error("Mem0 search error:", error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    completionCache.clear();
  }

  // Get cached completion if exists
  getCachedCompletion(text: string, model: string = config.defaultModel): string | null {
    const cacheKey = `${text}-${model}`;
    return completionCache.get(cacheKey) || null;
  }
}

export const aiService = AIService.getInstance();