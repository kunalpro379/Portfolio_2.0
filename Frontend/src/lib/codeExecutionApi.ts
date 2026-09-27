import { config } from "@/config/config";

const CODE_EXECUTION_API_URL = config.codeExecutionApiUrl;
const AUTH_TOKEN = config.codeExecutionAuthToken;

export interface CodeExecutionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

export interface CodeExecutionResponse {
  token: string;
  source_code: string;
  language_id: number;
  stdin: string | null;
  expected_output: string | null;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  created_at: string;
  finished_at: string;
  time: string;
  wall_time: string;
  memory: number;
  exit_code: number;
  exit_signal: string | null;
}

export const supportedLanguages = [
  { id: 71, name: "Python (3.8)", extension: "py" },
  { id: 63, name: "JavaScript (Node.js)", extension: "js" },
  { id: 54, name: "C++ (GCC 9.2)", extension: "cpp" },
  { id: 62, name: "Java (OpenJDK 13)", extension: "java" },
  { id: 50, name: "C (GCC 9.2)", extension: "c" },
  { id: 86, name: "TypeScript (5.0)", extension: "ts" },
  { id: 87, name: "C# (.NET 6)", extension: "cs" },
  { id: 75, name: "Rust (1.65)", extension: "rs" },
  { id: 81, name: "Go (1.18)", extension: "go" },
  { id: 76, name: "Ruby (3.0)", extension: "rb" },
];

export async function executeCode(
  request: CodeExecutionRequest
): Promise<CodeExecutionResponse> {
  const response = await fetch(`${CODE_EXECUTION_API_URL}/submissions?wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": AUTH_TOKEN,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Code execution failed: ${response.statusText}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
  const response = await fetch(`${CODE_EXECUTION_API_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}
