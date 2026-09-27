import { config } from "@/config/config";

export interface SSHConnectionConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  privateKey?: string;
}

export interface SSHAuthConfig {
  portfolioUsername?: string;
  portfolioPassword?: string;
  sshConfig?: SSHConnectionConfig;
}

export interface SSHSessionResponse {
  success: boolean;
  token?: string;
  wsUrl?: string;
  expiresInSeconds?: number;
  connectionInfo?: {
    host: string;
    username: string;
    port: number;
    authMethod: string;
  };
  message?: string;
  error?: string;
}

export interface SSHTestResponse {
  success: boolean;
  message?: string;
  connectionInfo?: {
    host: string;
    port: number;
    username: string;
  };
  error?: string;
}

export interface SSHConfigResponse {
  success: boolean;
  config?: {
    defaultHost: string | null;
    defaultUsername: string;
    authMethods: {
      password: boolean;
      privateKey: boolean;
      portfolioAuth: boolean;
    };
    features: {
      portfolioIntegration: boolean;
      connectionTesting: boolean;
      sessionEncryption: boolean;
    };
  };
}

export class SSHService {
  private static instance: SSHService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${config.apiUrl}/apps/ec2`;
  }

  static getInstance(): SSHService {
    if (!SSHService.instance) {
      SSHService.instance = new SSHService();
    }
    return SSHService.instance;
  }

  /**
   * Connect using portfolio authentication (recommended method)
   */
  async connectWithPortfolioAuth(authConfig: SSHAuthConfig): Promise<SSHSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/portfolio-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getStoredToken()}`,
        },
        body: JSON.stringify({
          username: authConfig.portfolioUsername,
          password: authConfig.portfolioPassword,
          sshConfig: authConfig.sshConfig || {},
        }),
      });

      const data: SSHSessionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Portfolio SSH auth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Connect with direct SSH credentials
   */
  async connectDirect(connectionConfig: SSHConnectionConfig): Promise<SSHSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig),
      });

      const data: SSHSessionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Direct SSH connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Test SSH connection without creating a session
   */
  async testConnection(connectionConfig: SSHConnectionConfig): Promise<SSHTestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig),
      });

      const data: SSHTestResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('SSH connection test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      };
    }
  }

  /**
   * Get SSH configuration and capabilities
   */
  async getConfig(): Promise<SSHConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/config`);
      const data: SSHConfigResponse = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to get SSH config');
      }

      return data;
    } catch (error) {
      console.error('SSH config fetch error:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ success: boolean; status?: string; features?: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('SSH health check error:', error);
      return { success: false };
    }
  }

  /**
   * Create WebSocket connection for terminal
   */
  createTerminalWebSocket(token: string): WebSocket {
    const wsUrl = config.apiUrl.replace('http', 'ws').replace('/api', '');
    return new WebSocket(`${wsUrl}/ws/ec2?token=${token}`);
  }

  /**
   * Get stored authentication token
   */
  private getStoredToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('authToken') || '';
  }
}

export const sshService = SSHService.getInstance();

// WebSocket message types for terminal communication
export interface TerminalMessage {
  type: 'output' | 'error' | 'status' | 'input' | 'resize';
  data?: string;
  message?: string;
  rows?: number;
  cols?: number;
}

// Terminal WebSocket handler utility
export class TerminalWebSocketHandler {
  private ws: WebSocket | null = null;
  private onMessage: ((message: TerminalMessage) => void) | null = null;
  private onConnect: (() => void) | null = null;
  private onDisconnect: (() => void) | null = null;

  constructor(token: string) {
    this.ws = sshService.createTerminalWebSocket(token);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Terminal WebSocket connected');
      this.onConnect?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: TerminalMessage = JSON.parse(event.data);
        this.onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse terminal message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Terminal WebSocket disconnected');
      this.onDisconnect?.();
    };

    this.ws.onerror = (error) => {
      console.error('Terminal WebSocket error:', error);
    };
  }

  setMessageHandler(handler: (message: TerminalMessage) => void) {
    this.onMessage = handler;
  }

  setConnectHandler(handler: () => void) {
    this.onConnect = handler;
  }

  setDisconnectHandler(handler: () => void) {
    this.onDisconnect = handler;
  }

  sendInput(data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'input', data }));
    }
  }

  resize(rows: number, cols: number) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'resize', rows, cols }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}