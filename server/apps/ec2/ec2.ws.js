/**
 * EC2 WebSocket Terminal Handler
 * 
 * Attach this to the raw http.Server BEFORE express processes it.
 * 
 * Flow:
 *   1. Browser connects: ws://host/ws/ec2?token=<uuid>
 *   2. Server validates + consumes the one-time token
 *   3. ssh2 shell opened to EC2 using decrypted creds
 *   4. Bidirectional: browser input → SSH → browser output
 *   5. On disconnect → SSH session terminated immediately
 */

import { WebSocketServer } from 'ws';
import { EC2Service } from './ec2.service.js';

export function attachEC2WebSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/ec2',
  });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.send(JSON.stringify({ type: 'error', message: 'Missing session token' }));
      ws.close(1008, 'Missing token');
      return;
    }

    let creds;
    try {
      creds = EC2Service.consumeSession(token);
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
      ws.close(1008, 'Auth failed');
      return;
    }

    console.log(`[EC2-WS] New terminal session → ${creds.username}@${creds.host}:${creds.port}`);
    ws.send(JSON.stringify({ type: 'status', message: `Connecting to ${creds.host}…` }));

    EC2Service.attachSSHToWebSocket(ws, creds);
  });

  console.log('✓ EC2 WebSocket terminal handler attached at /ws/ec2');
  return wss;
}
