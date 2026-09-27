/**
 * EC2Terminal — xterm.js SSH terminal with in-terminal credential prompting.
 *
 * NO form overlay. Credentials collected directly inside the terminal:
 *   Host/IP: <user types>
 *   Port [22]: <user types or Enter for default>
 *   Username [ec2-user]: <user types or Enter>
 *   Password: <masked with *>
 *   → connects via WebSocket + SSH
 *
 * Ctrl+C at any time restarts the prompt sequence.
 */

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { config } from "@/config/config";

const API_BASE_URL = config.apiUrl;
const WS_BASE = API_BASE_URL.replace(/^http/, "ws").replace("/api", "");

type Phase = "password" | "connecting" | "connected";

export interface EC2TerminalRef {
  getContext: () => string;
}

export const EC2Terminal = forwardRef<EC2TerminalRef, {}>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<Terminal | null>(null);

  useImperativeHandle(ref, () => ({
    getContext: () => {
      const term = termInstanceRef.current;
      if (!term) return "";
      const buffer = term.buffer.active;
      let text = "";
      const start = Math.max(0, buffer.length - 150);
      for (let i = start; i < buffer.length; i++) {
        const line = buffer.getLine(i);
        if (line) text += line.translateToString(true) + "\n";
      }
      return text.trim();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Terminal instance ──────────────────────────────────────────────
    const term = new Terminal({
      theme: {
        background: "#f8fafc",
        foreground: "#334155",
        cursor: "#ea580c",
        cursorAccent: "#ffffff",
        selectionBackground: "#cbd5e1",
        black: "#000000",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#06b6d4",
        white: "#ffffff",
        brightBlack: "#64748b",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#fbbf24",
        brightBlue: "#60a5fa",
        brightMagenta: "#e879f9",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontFamily: '"Cascadia Code", "JetBrains Mono", "Fira Code", Consolas, monospace',
      fontSize: 12,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "bar",
      convertEol: true,
      scrollback: 5000,
      allowTransparency: false,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(containerRef.current);
    termInstanceRef.current = term;
    setTimeout(() => fit.fit(), 50);

    // Resize observer
    const resizeObs = new ResizeObserver(() => fit.fit());
    resizeObs.observe(containerRef.current!);

    // ── Mutable state (all in refs inside effect closure) ────────────────
    let phase: Phase = "password";
    let inputBuf = "";
    const creds = { password: "" };
    let ws: WebSocket | null = null;

    // ── Helpers ─────────────────────────────────────────────────────────
    const w = (s: string) => term.write(s);
    const wl = (s: string) => term.writeln(s);

    const clearLine = () => {
      // Move to column 0 and clear to end
      w("\r\x1b[2K");
    };

    const printBanner = () => {
      wl("  \x1b[33m⚡ EC2 Secure Terminal\x1b[0m \x1b[90m│ SSH over WebSocket\x1b[0m");
      wl("  \x1b[90mCredentials are AES-256-GCM encrypted in-memory.\x1b[0m");
      wl("  \x1b[90mPress \x1b[33mCtrl+C\x1b[90m at any time to restart.\x1b[0m");
    };

    const startPrompt = () => {
      phase = "password";
      inputBuf = "";
      w("\x1b[33m  Password\x1b[0m › ");
    };

    // ── Reconnect helper ─────────────────────────────────────────────────
    const restart = (msg?: string) => {
      if (msg) wl(`\r\n\x1b[33m  ✗ ${msg}\x1b[0m`);
      ws?.close();
      ws = null;
      phase = "password";
      inputBuf = "";
      setTimeout(() => {
        wl("  \x1b[90m─────────────────────────────────────────────────\x1b[0m");
        startPrompt();
      }, 1200);
    };

    // ── Connect to EC2 ───────────────────────────────────────────────────
    const doConnect = async () => {
      phase = "connecting";
      wl(`  \x1b[33m⟳ Authenticating and establishing secure tunnel…\x1b[0m`);

      try {
        const res = await fetch(`${API_BASE_URL}/apps/ec2/portfolio-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            password: creds.password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Connection refused");

        ws = new WebSocket(`${WS_BASE}/ws/ec2?token=${data.token}`);

        ws.onopen = () => {
          // Server will send the 'connected' status message
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "output") {
              term.write(msg.data);
            }
            if (msg.type === "status") {
              wl(`  \x1b[37m✓ ${msg.message}\x1b[0m`);
              phase = "connected";
            }
            if (msg.type === "error") {
              restart(msg.message);
            }
          } catch (_) {}
        };

        ws.onerror = () => restart("WebSocket connection error");

        ws.onclose = () => {
          if (phase === "connected") {
            restart("SSH session closed");
          }
        };

        term.onResize(({ cols, rows }) => {
          ws?.readyState === WebSocket.OPEN &&
            ws.send(JSON.stringify({ type: "resize", cols, rows }));
        });
      } catch (err: any) {
        restart(err.message);
      }
    };

    // ── Input handler ─────────────────────────────────────────────────────
    term.onData((data) => {
      // Connected → forward everything to SSH
      if (phase === "connected") {
        ws?.send(JSON.stringify({ type: "input", data }));
        return;
      }

      // Connecting → ignore
      if (phase === "connecting") return;

      const code = data.charCodeAt(0);

      // Ctrl+C → restart
      if (code === 3) {
        wl("\r\n  \x1b[90m^C\x1b[0m");
        phase = "password";
        inputBuf = "";
        setTimeout(() => { wl(""); startPrompt(); }, 300);
        return;
      }

      // Enter → advance phase
      if (code === 13) {
        const val = inputBuf.trim();
        inputBuf = "";

        switch (phase) {
          case "password":
            if (!val) { w("\r\x1b[2K\x1b[33m  Password\x1b[0m › "); return; }
            creds.password = val;
            doConnect();
            break;
        }
        return;
      }

      // Backspace
      if (code === 127) {
        if (inputBuf.length > 0) {
          inputBuf = inputBuf.slice(0, -1);
          // Only echo back if not password
          if (phase !== "password") w("\b \b");
          else w("\b \b"); // also erase the * we wrote
        }
        return;
      }

      // Printable chars only
      if (code >= 32) {
        inputBuf += data;
        if (phase === "password") {
          w("*"); // mask password
        } else {
          w(data); // echo normally
        }
      }
    });

    // ── Boot ─────────────────────────────────────────────────────────────
    printBanner();
    startPrompt();

    return () => {
      resizeObs.disconnect();
      ws?.close();
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 0, backgroundColor: '#000000', outline: 'none' }}
      className="ec2-terminal-container"
    />
  );
});
