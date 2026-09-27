import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { 
  sshService, 
  TerminalWebSocketHandler, 
  TerminalMessage 
} from '@/services/sshService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Lock, Zap } from 'lucide-react';

import '@xterm/xterm/css/xterm.css';

interface SSHTerminalProps {
  className?: string;
}

export const SSHTerminal: React.FC<SSHTerminalProps> = ({ className }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const wsHandler = useRef<TerminalWebSocketHandler | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(true);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    terminal.current = new Terminal({
      theme: {
        background: '#000000',
        foreground: '#00ff41',
        cursor: '#00ff41',
        selection: 'rgba(0, 255, 65, 0.2)',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff41',
        yellow: '#ffff00',
        blue: '#0099ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#555555',
        brightRed: '#ff5555',
        brightGreen: '#55ff55',
        brightYellow: '#ffff55',
        brightBlue: '#5555ff',
        brightMagenta: '#ff55ff',
        brightCyan: '#55ffff',
        brightWhite: '#ffffff'
      },
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 14,
      fontWeight: 'normal',
      fontWeightBold: 'bold',
      rows: 35,
      cols: 120,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: false,
      scrollback: 1000,
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.loadAddon(new WebLinksAddon());

    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Matrix-style welcome
    terminal.current.writeln('\\x1b[1;32m█████████████████████████████████████████████████████████████████████████████████\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█                                                                               █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ███████╗███████╗██╗  ██╗    ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ██╔════╝██╔════╝██║  ██║    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ███████╗███████╗███████║       ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ╚════██║╚════██║██╔══██║       ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ███████║███████║██║  ██║       ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█  ╚══════╝╚══════╝╚═╝  ╚═╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝ █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█                                                                               █\\x1b[0m');
    terminal.current.writeln('\\x1b[1;32m█████████████████████████████████████████████████████████████████████████████████\\x1b[0m');
    terminal.current.writeln('');
    terminal.current.writeln('\\x1b[1;36m                     🚀 PREMIUM AWS EC2 SSH TERMINAL 🚀                      \\x1b[0m');
    terminal.current.writeln('\\x1b[1;33m                        Portfolio 2.0 • Secure Access                        \\x1b[0m');
    terminal.current.writeln('');
    terminal.current.writeln('\\x1b[0;32m[SYSTEM] Terminal initialized. Enter your password to connect...\\x1b[0m');
    terminal.current.writeln('');

    // Handle terminal input (when connected)
    terminal.current.onData((data) => {
      if (wsHandler.current?.isConnected) {
        wsHandler.current.sendInput(data);
      }
    });

    // Handle terminal resize
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        fitAddon.current.fit();
        if (wsHandler.current?.isConnected) {
          wsHandler.current.resize(terminal.current.rows, terminal.current.cols);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Load SSH configuration
    loadSSHConfig();

    return () => {
      window.removeEventListener('resize', handleResize);
      disconnect();
      terminal.current?.dispose();
    };
  }, []);

  const loadSSHConfig = async () => {
    const config = await sshService.getConfig();
    if (config.success && config.config) {
      setSSHConfig(config.config);
      if (config.config.defaultHost) {
        setDirectAuth(prev => ({ ...prev, host: config.config!.defaultHost || '' }));
      }
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    setError('');
    setConnectionStatus('Connecting...');

    try {
      let result;
      
      if (authMethod === 'portfolio') {
        result = await sshService.connectWithPortfolioAuth({
          portfolioUsername: portfolioAuth.username,
          portfolioPassword: portfolioAuth.password,
        });
      } else {
        result = await sshService.connectDirect(directAuth);
      }

      if (!result.success || !result.token) {
        throw new Error(result.error || 'Connection failed');
      }

      // Clear terminal
      terminal.current?.clear();
      
      // Create WebSocket connection
      wsHandler.current = new TerminalWebSocketHandler(result.token);
      
      wsHandler.current.setConnectHandler(() => {
        setIsConnected(true);
        setConnectionStatus(`Connected to ${result.connectionInfo?.host}`);
        terminal.current?.writeln('\\x1b[1;32m✓ SSH connection established\\x1b[0m');
        
        // Resize terminal to fit
        if (fitAddon.current && terminal.current) {
          fitAddon.current.fit();
          wsHandler.current?.resize(terminal.current.rows, terminal.current.cols);
        }
      });

      wsHandler.current.setMessageHandler((message: TerminalMessage) => {
        switch (message.type) {
          case 'output':
            if (message.data && terminal.current) {
              terminal.current.write(message.data);
            }
            break;
          case 'status':
            if (message.message) {
              terminal.current?.writeln(`\\x1b[1;36m${message.message}\\x1b[0m`);
            }
            break;
          case 'error':
            if (message.message) {
              terminal.current?.writeln(`\\x1b[1;31m❌ ${message.message}\\x1b[0m`);
            }
            break;
        }
      });

      wsHandler.current.setDisconnectHandler(() => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        terminal.current?.writeln('\\r\\n\\x1b[1;31m❌ SSH session ended\\x1b[0m');
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      terminal.current?.writeln(`\\x1b[1;31m❌ ${errorMessage}\\x1b[0m`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (wsHandler.current) {
      wsHandler.current.disconnect();
      wsHandler.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  };

  const testConnection = async () => {
    setError('');
    try {
      const result = await sshService.testConnection(directAuth);
      if (result.success) {
        terminal.current?.writeln(`\\x1b[1;32m✓ Connection test successful: ${result.message}\\x1b[0m`);
      } else {
        terminal.current?.writeln(`\\x1b[1;31m❌ Connection test failed: ${result.error}\\x1b[0m`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      terminal.current?.writeln(`\\x1b[1;31m❌ ${errorMessage}\\x1b[0m`);
    }
  };

  return (
    <div className={`ssh-terminal-container ${className}`}>
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 border-b">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5" />
          <span className="font-medium">SSH Terminal</span>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connectionStatus}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {isConnected && (
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Connection Panel */}
        <div className="w-80 border-r bg-white dark:bg-slate-900 overflow-auto">
          <Card className="m-4 border-0 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">SSH Connection</CardTitle>
              <CardDescription>
                Connect to your AWS EC2 instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as 'portfolio' | 'direct')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="portfolio">Portfolio Auth</TabsTrigger>
                  <TabsTrigger value="direct">Direct SSH</TabsTrigger>
                </TabsList>

                {/* Portfolio Authentication */}
                <TabsContent value="portfolio" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-username">Portfolio Username</Label>
                    <Input
                      id="portfolio-username"
                      value={portfolioAuth.username}
                      onChange={(e) => setPortfolioAuth(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Your portfolio username"
                      disabled={isConnecting || isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-password">Portfolio Password</Label>
                    <Input
                      id="portfolio-password"
                      type="password"
                      value={portfolioAuth.password}
                      onChange={(e) => setPortfolioAuth(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Your portfolio password"
                      disabled={isConnecting || isConnected}
                    />
                  </div>
                  {sshConfig && (
                    <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <p><strong>Target:</strong> {sshConfig.defaultHost || 'Not configured'}</p>
                      <p><strong>Username:</strong> {sshConfig.defaultUsername}</p>
                      <p><strong>Auth:</strong> {sshConfig.authMethods.privateKey ? 'SSH Key' : 'Password'}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Direct SSH Authentication */}
                <TabsContent value="direct" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="ssh-host">Host</Label>
                      <Input
                        id="ssh-host"
                        value={directAuth.host}
                        onChange={(e) => setDirectAuth(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="EC2 IP address"
                        disabled={isConnecting || isConnected}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ssh-port">Port</Label>
                      <Input
                        id="ssh-port"
                        type="number"
                        value={directAuth.port}
                        onChange={(e) => setDirectAuth(prev => ({ ...prev, port: parseInt(e.target.value) || 22 }))}
                        disabled={isConnecting || isConnected}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssh-username">Username</Label>
                    <Input
                      id="ssh-username"
                      value={directAuth.username}
                      onChange={(e) => setDirectAuth(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="ec2-user"
                      disabled={isConnecting || isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssh-password">Password</Label>
                    <Input
                      id="ssh-password"
                      type="password"
                      value={directAuth.password}
                      onChange={(e) => setDirectAuth(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="SSH password"
                      disabled={isConnecting || isConnected}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testConnection}
                      disabled={isConnecting || isConnected || !directAuth.host || !directAuth.username}
                    >
                      Test
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={connect}
                disabled={isConnecting || isConnected}
                className="w-full mt-4"
              >
                {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Terminal */}
        <div className="flex-1 bg-slate-900">
          <div ref={terminalRef} className="w-full h-full p-4" />
        </div>
      </div>
    </div>
  );
};

export default SSHTerminal;