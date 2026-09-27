import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { config } from "@/config/config";

export const Route = createFileRoute("/terminal")({
  component: TerminalPage,
});

function TerminalPage() {
  const [password, setPassword] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [command, setCommand] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = config.apiUrl;

  // Auto-scroll terminal
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsConnecting(true);
    setError("");

    try {
      // Connect to EC2 using the provided password
      const response = await fetch(`${API_BASE_URL}/apps/ec2/quick-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioPassword: password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      // Initialize WebSocket connection
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = API_BASE_URL.replace(/^http(s)?:\/\//, ""); // remove http:// or https://
      
      const wsUrl = `${wsProtocol}//${wsHost}${data.wsUrl}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setOutput("AWS EC2 Secure Connection Established.\\nWelcome to Portfolio Server.\\n\\n");
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "output") {
          setOutput((prev) => prev + message.data);
        } else if (message.type === "error") {
          setOutput((prev) => prev + `\\n[ERROR]: ${message.message}\\n`);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setOutput((prev) => prev + "\\nConnection closed.\\n");
      };

      wsRef.current.onerror = () => {
        setError("WebSocket connection error.");
        setIsConnecting(false);
      };
    } catch (err: any) {
      setError(err.message || "Failed to connect to EC2 instance.");
      setIsConnecting(false);
    }
  };

  const sendCommand = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && command.trim()) {
      wsRef.current.send(
        JSON.stringify({
          type: "input",
          data: command + "\\n",
        })
      );
      setCommand("");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="w-full max-w-md p-8 border border-neutral-800 rounded-lg shadow-2xl bg-[#0a0a0a]">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <h1 className="text-white text-xl text-center font-semibold mb-2 tracking-widest uppercase">
            System Access
          </h1>
          <p className="text-neutral-500 text-center text-xs mb-8 tracking-widest">
            AUTHENTICATION REQUIRED
          </p>

          <form onSubmit={handleConnect} className="flex flex-col gap-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Passkey"
                className="w-full bg-black border-b border-neutral-700 text-white px-3 py-3 outline-none focus:border-white transition-colors text-center tracking-widest placeholder:text-neutral-600"
                disabled={isConnecting}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-xs text-center tracking-wider bg-red-950/30 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isConnecting || !password}
              className="w-full bg-white text-black py-3 px-4 font-bold tracking-widest uppercase text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isConnecting ? "Authenticating..." : "Initialize Connection"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#00ff00] font-mono flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs tracking-wider text-green-500 font-semibold uppercase">Secure Shell Active</span>
        </div>
        <button
          onClick={() => {
            if (wsRef.current) wsRef.current.close();
            setIsConnected(false);
            setPassword("");
            setOutput("");
          }}
          className="text-xs text-red-500 hover:text-red-400 uppercase tracking-wider"
        >
          Disconnect
        </button>
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 text-sm sm:text-base leading-relaxed"
        style={{ whiteSpace: "pre-wrap" }}
        onClick={() => document.getElementById("cmd-input")?.focus()}
      >
        {output}
      </div>

      {/* Terminal Input */}
      <div className="p-4 border-t border-[#333] flex items-center bg-[#0a0a0a]">
        <span className="text-green-500 mr-3">➜</span>
        <span className="text-blue-400 mr-2">~</span>
        <input
          id="cmd-input"
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand()}
          className="flex-1 bg-transparent border-none outline-none text-[#00ff00] placeholder:text-[#005500]"
          placeholder="Type a command..."
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
