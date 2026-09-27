import { useState, useEffect } from "react";
import { Play, Loader2, Copy, Check, X, RefreshCw } from "lucide-react";
import Editor from "@monaco-editor/react";
import { executeCode, supportedLanguages, CodeExecutionResponse } from "@/lib/codeExecutionApi";
import { config } from "@/config/config";

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: number;
  readOnly?: boolean;
}

export function CodeEditor({ initialCode = "", initialLanguage = 71, readOnly = false }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [languageId, setLanguageId] = useState(initialLanguage);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync with incoming code changes from agent or file switch
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const selectedLanguage = supportedLanguages.find((lang) => lang.id === languageId) || supportedLanguages[0];

  const handleExecute = async () => {
    if (!code.trim()) {
      setError("Please enter some code to execute");
      return;
    }

    setIsExecuting(true);
    setError(null);
    setOutput(null);

    try {
      // Execute via our backend API apps/coding/execute
      const res = await fetch(`${config.apiUrl}/apps/coding/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage.name.split(' ')[0].toLowerCase(), // e.g., 'python', 'c++', 'javascript'
          content: code
        })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to execute");
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute code");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleClear = () => {
    setCode("");
    setOutput(null);
    setError(null);
  };

  const getMonacoLang = () => {
    const map: Record<number, string> = {
      71: "python",
      63: "javascript",
      54: "cpp",
      62: "java",
      50: "c",
      86: "typescript",
      87: "csharp",
      75: "rust",
      81: "go",
      76: "ruby"
    };
    return map[languageId] || "javascript";
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      {/* Language Selection and Actions */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e2e8f0] bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-3">
          <select
            value={languageId}
            onChange={(e) => setLanguageId(Number(e.target.value))}
            disabled={readOnly}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!code.trim()}
            className="flex items-center gap-1.5 rounded bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          
          <button
            type="button"
            onClick={handleExecute}
            disabled={readOnly || isExecuting || !code.trim()}
            className="flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isExecuting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            Run Code
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex min-h-0 flex-1 flex-col relative">
        <Editor
          height="100%"
          language={getMonacoLang()}
          theme="light"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            readOnly: readOnly,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
          }}
        />
      </div>

      {/* Output Terminal Area */}
      {(output || error || isExecuting) && (
        <div className="flex h-1/3 min-h-[150px] flex-col border-t border-[#e2e8f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-slate-50 px-4 py-1.5">
            <span className="text-xs font-semibold text-slate-700">TERMINAL</span>
            <button onClick={() => { setOutput(null); setError(null); }} className="text-slate-500 hover:text-slate-800">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {isExecuting && (
              <div className="text-slate-600 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Executing locally...
              </div>
            )}
            {error && <div className="text-red-600">{error}</div>}
            {output && !isExecuting && (
              <div className="space-y-2">
                {output.stdout && <pre className="text-slate-700 whitespace-pre-wrap">{output.stdout}</pre>}
                {output.stderr && <pre className="text-red-600 whitespace-pre-wrap">{output.stderr}</pre>}
                {output.output && !output.stdout && !output.stderr && (
                  <pre className="text-slate-700 whitespace-pre-wrap">{output.output}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
