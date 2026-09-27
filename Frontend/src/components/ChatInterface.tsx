import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { config } from "@/config/config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: "Hi there! 👋 I'm Kunal's AI assistant.",
    timestamp: "Just now",
  },
  {
    id: "welcome-2",
    role: "assistant",
    content: "I know all about his work in **Agentic AI**, **Cloud & DevOps**, and his latest projects.",
    timestamp: "Just now",
  },
  {
    id: "welcome-3",
    role: "user",
    content: "What are some of his recent projects?",
    timestamp: "Just now",
  },
  {
    id: "welcome-4",
    role: "assistant",
    content: "He recently built a multi-agent **Agentic IDE**, deployed automated **AWS CI/CD pipelines**, and developed an **AQI ML forecasting model** with live streaming!",
    timestamp: "Just now",
  },
  {
    id: "welcome-5",
    role: "user",
    content: "That sounds awesome. How can I contact him?",
    timestamp: "Just now",
  },
  {
    id: "welcome-6",
    role: "assistant",
    content: "You can reach him at [kunaldp379@gmail.com](mailto:kunaldp379@gmail.com) or type 'resume' to download his CV. Feel free to ask me anything else!",
    timestamp: "Just now",
  }
];

// Contextual fallback knowledge base for instant responses
function getLocalFallbackAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("project") || q.includes("work") || q.includes("built") || q.includes("repo")) {
    return "Kunal has shipped **50+ projects** across multiple domains:\n\n• **Cloud & DevOps**: Automated AWS ECS, Docker & GitHub Actions CI/CD infrastructure.\n• **AQI ML Forecasting**: Hybrid ARIMA-LSTM time-series model with live Firebase streaming.\n• **Agentic AI**: Multi-agent autonomous systems with tool-use and RAG architectures.\n• **Full-Stack Apps**: Production TanStack Start and Node.js enterprise platforms.\n\nCheck out the **Projects** section for live demos and code!";
  }

  if (q.includes("skill") || q.includes("stack") || q.includes("tech") || q.includes("technolog")) {
    return "Kunal's core technical toolkit includes:\n\n• **AI & ML**: PyTorch, TensorFlow, LLMs, Agentic AI, RAG, Time-Series Forecasting\n• **Backend**: Node.js, SpringBoot, Java, Python, RESTful APIs\n• **Cloud & DevOps**: AWS (ECS, EC2, ECR, ALB), Docker, CI/CD, GitHub Actions\n• **Frontend**: React, TanStack Start, TypeScript, Tailwind CSS\n• **Data**: PostgreSQL, MongoDB, SQL, Firebase, Azure Storage";
  }

  if (q.includes("experience") || q.includes("company") || q.includes("job") || q.includes("role") || q.includes("intern")) {
    return "Kunal's key experience:\n\n• **Agentic AI Specialist** @ *Idolize Business Solutions* (Present): Production multi-agent workflows.\n• **ML Intern** @ *Panache Digilife* (2025): Hybrid ARIMA-LSTM air quality prediction.\n• **Full-Stack Intern** @ *ProSmart Concepts* (2024–2025): n8n automation & web apps.\n• **DevOps Engineer** @ *Plasma X Valnee* (2024): Scalable AWS infrastructure.";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("hire") || q.includes("reach") || q.includes("phone")) {
    return "You can get in touch with Kunal directly:\n\n• **Email**: [kunaldp379@gmail.com](mailto:kunaldp379@gmail.com)\n• **Phone**: +91 9892885090\n• **Location**: Mumbai, Maharashtra, India\n• **GitHub**: [github.com/kunalpro379](https://github.com/kunalpro379)\n\nHe is open for full-time roles, freelance projects, and remote collaborations!";
  }

  if (q.includes("resume") || q.includes("cv")) {
    return "You can view Kunal's updated resume here: [Download Resume (PDF)](https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf).";
  }

  if (q.includes("education") || q.includes("college") || q.includes("degree")) {
    return "Kunal is pursuing his **B.Tech in Artificial Intelligence & Data Science** at *VESIT (Vivekanand Education Society Institute of Technology)*, Mumbai (2022–2026) with a **8.1 CGPA**.";
  }

  return "Something went wrong.";
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const runIntroSequence = useCallback(async () => {
    setIsLoading(true);
    setMessages([]);
    for (let i = 0; i < INITIAL_MESSAGES.length; i++) {
      await new Promise(r => setTimeout(r, 600 + i * 200));
      setMessages(prev => {
        const newMsgs = [...prev, INITIAL_MESSAGES[i]];
        setTimeout(scrollToBottom, 20);
        return newMsgs;
      });
    }
    setIsLoading(false);
  }, [scrollToBottom]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    runIntroSequence();
  }, [runIntroSequence]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Instant state update - zero latency
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(scrollToBottom, 20);

    const getPageContext = () => {
      try {
        const text = document.body.innerText || "";
        return text.substring(0, 3000); // Limit to 3000 chars to avoid massive payloads
      } catch (e) {
        return "";
      }
    };



    // Call API or Fallback
    let answer = "";
    try {
      const endpoints = [
        `${config.apiUrl}/ai-chat/chat`,
        `${config.apiUrl}/chat`,
      ];

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, context: getPageContext() }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data?.message || data?.response) {
              answer = data.message || data.response;
              break;
            }
          }
        } catch {
          // Try next
        }
      }

      if (!answer) {
        answer = getLocalFallbackAnswer(text);
      }
    } catch {
      answer = getLocalFallbackAnswer(text);
    }

    setIsLoading(false);

    // Smooth efficient chunking without UI lag (chunks of 3-4 words)
    const assistantId = "a-" + Date.now();
    const words = answer.split(" ");
    
    // Add placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    let currentIndex = 0;
    const chunkSize = 3;
    let accumulated = "";

    const timer = setInterval(() => {
      if (currentIndex < words.length) {
        const nextWords = words.slice(currentIndex, currentIndex + chunkSize).join(" ");
        accumulated += (accumulated ? " " : "") + nextWords;
        currentIndex += chunkSize;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
        scrollToBottom();
      } else {
        clearInterval(timer);
        scrollToBottom();
      }
    }, 45);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setInput("");
    runIntroSequence();
  };

  return (
    <div className="flex h-full w-full flex-col bg-transparent text-foreground">
      {/* Header: Clean, centered title only */}
      <div className="shrink-0 relative flex items-center justify-center border-b border-black/10 py-2.5 px-3 bg-transparent">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-[#8B4513]" />
          <h3 className="font-display text-[12px] sm:text-[13px] font-bold tracking-tight text-black">
            Chat with Kunal
          </h3>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={resetChat}
            title="Reset Chat"
            className="absolute right-2 text-black/40 transition-colors hover:text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages Scrollable Area: Independently scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-2.5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.15) transparent",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in slide-in-from-bottom-3 fade-in duration-300`}
          >
            {/* Bubble */}
            <div
              className={`max-w-[88%] rounded-2xl px-2.5 py-1.5 text-[10px] sm:text-[10.5px] leading-[1.6] shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                msg.role === "user"
                  ? "rounded-tr-xs bg-black text-white font-medium"
                  : "rounded-tl-xs bg-white/95 text-black/90 border border-black/10"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-xs max-w-none text-[10px] sm:text-[10.5px] leading-[1.6] text-black/90">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-black">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-1 list-disc pl-3.5 space-y-0.5">{children}</ul>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#8B4513] underline hover:text-black"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
            </div>

            <span className="mt-0.5 px-1 text-[8px] text-black/40">{msg.timestamp}</span>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="rounded-2xl rounded-tl-xs bg-white/95 border border-black/10 px-3 py-2 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/60 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/60 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/60" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar: Pushed nicely to the bottom */}
      <div className="shrink-0 pt-2 pb-2 px-2 bg-transparent border-t border-black/10 mt-auto">
        <div className="flex items-center gap-1 rounded-xl border border-black/20 bg-white/90 p-1 shadow-xs transition-all focus-within:border-black focus-within:bg-white focus-within:ring-1 focus-within:ring-black/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask anything about Kunal..."
            className="flex-1 bg-transparent px-2.5 py-1 text-[10.5px] sm:text-[11px] text-black placeholder:text-black/45 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-black text-white transition-all hover:bg-[#8B4513] disabled:opacity-25 disabled:hover:bg-black"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
