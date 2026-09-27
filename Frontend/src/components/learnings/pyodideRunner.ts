import { config } from "@/config/config";

let pyodidePromise: Promise<any> | null = null;
let pyodideInstance: any = null;

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    try {
      if (typeof window === "undefined") {
        throw new Error("Window not available");
      }

      // Check if pyodide script is already present
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector('script[src*="pyodide"]');
          if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            existingScript.addEventListener("error", (e) => reject(e));
            return;
          }

          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN"));
          document.head.appendChild(script);
        });
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
      });

      // Configure stdout and stderr capture in Python
      await pyodide.runPythonAsync(`
import sys
import io

class WebCapture:
    def __init__(self):
        self.buffer = io.StringIO()
    def write(self, s):
        self.buffer.write(s)
    def flush(self):
        pass
    def getvalue(self):
        return self.buffer.getvalue()
    def clear(self):
        self.buffer = io.StringIO()

__jupyter_stdout = WebCapture()
__jupyter_stderr = WebCapture()
sys.stdout = __jupyter_stdout
sys.stderr = __jupyter_stderr
      `);

      pyodideInstance = pyodide;
      return pyodide;
    } catch (err) {
      console.warn("Pyodide in-browser setup failed, will fallback to backend runner:", err);
      pyodidePromise = null;
      throw err;
    }
  })();

  return pyodidePromise;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  result: string | null;
  error: string | null;
  engine: "pyodide" | "server";
}

export async function runPythonCode(code: string, engine: "pyodide" | "server" = "pyodide"): Promise<PythonExecutionResult> {
  // Pre-process code to comment out shell/magic commands (! and %)
  const lines = code.split("\n");
  const filteredLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("!pip install ")) {
      const pkgs = trimmed.replace("!pip install ", "").trim();
      return `import micropip\nawait micropip.install([p for p in "${pkgs}".split(" ") if p])\nprint("Installed ${pkgs}")`;
    }
    if (trimmed.startsWith("!") || trimmed.startsWith("%")) {
      return `# Unsupported magic/shell command skipped: ${trimmed}`;
    }
    return line;
  });
  const processedCode = filteredLines.join("\n");

  if (engine === "pyodide") {
    // 1. Try Pyodide in browser
    try {
      const pyodide = await getPyodide();
      if (pyodide) {
        // Clear capture buffers before executing
        await pyodide.runPythonAsync(`
__jupyter_stdout.clear()
__jupyter_stderr.clear()
        `);

        let evalResult: any = undefined;
        let runtimeError: string | null = null;

        try {
          await pyodide.loadPackagesFromImports(processedCode);
          evalResult = await pyodide.runPythonAsync(processedCode);
        } catch (err: any) {
          runtimeError = err?.message || String(err);
        }

        const stdout = await pyodide.runPythonAsync(`__jupyter_stdout.getvalue()`);
        const stderr = await pyodide.runPythonAsync(`__jupyter_stderr.getvalue()`);

        let formattedResult: string | null = null;
        if (evalResult !== undefined && evalResult !== null) {
          try {
            if (typeof evalResult === "object" && typeof evalResult.toJs === "function") {
              const jsVal = evalResult.toJs();
              formattedResult = typeof jsVal === "object" ? JSON.stringify(jsVal, null, 2) : String(jsVal);
            } else {
              formattedResult = String(evalResult);
            }
          } catch {
            formattedResult = String(evalResult);
          }
        }

        return {
          stdout: stdout || "",
          stderr: stderr || "",
          result: formattedResult,
          error: runtimeError,
          engine: "pyodide"
        };
      }
    } catch (pyodideErr) {
      console.log("Attempting backend execution due to pyodide state:", pyodideErr);
    }
  }

  // 2. Fallback to server execution
  try {
    const res = await fetch(`${config.apiUrl}/apps/coding/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "python", content: processedCode })
    });
    const data = await res.json();
    if (!data.success && !data.output) {
      return {
        stdout: "",
        stderr: data.error || data.details || "Execution failed",
        result: null,
        error: data.error || data.details || "Execution failed",
        engine: "server"
      };
    }
    return {
      stdout: data.stdout || data.output || "",
      stderr: data.stderr || "",
      result: null,
      error: data.code !== 0 && data.stderr ? data.stderr : null,
      engine: "server"
    };
  } catch (serverErr: any) {
    return {
      stdout: "",
      stderr: serverErr?.message || "Execution failed",
      result: null,
      error: serverErr?.message || "Failed to reach execution service",
      engine: "server"
    };
  }
}
