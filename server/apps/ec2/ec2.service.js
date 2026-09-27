/**
 * EC2 SSH Terminal Service
 * 
 * Architecture:
 *   Browser (xterm.js) <──WebSocket──> Node.js (this file) <──SSH──> EC2
 * 
 * Security:
 *  - Credentials NEVER stored on disk or in DB
 *  - Per-session one-time tokens (UUID) with 60s TTL for WS handshake
 *  - AES-256-GCM encrypted token payload in memory only
 *  - SSH connection closed on WS disconnect / timeout
 */

import { Client as SSHClient } from 'ssh2';
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const SECRET = process.env.EC2_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const KEY = crypto.scryptSync(SECRET, 'ec2-salt', 32);

// In-memory session store: token → { encrypted creds, expiry }
const sessionStore = new Map();

// Clean up expired sessions every 30s
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessionStore) {
    if (session.expiry < now) sessionStore.delete(token);
  }
}, 30_000);

function encrypt(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex'), tag: tag.toString('hex') };
}

function decrypt(payload) {
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(payload.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encrypted, 'hex')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

export const EC2Service = {
  /**
   * Create a short-lived session token from credentials.
   * The password is AES-256-GCM encrypted in memory only.
   * Returns a token the frontend uses to upgrade to WebSocket.
   */
  createSession({ host, port = 22, username, password, privateKey }) {
    if (!host || !username) throw new Error('host and username are required');
    if (!password && !privateKey) throw new Error('password or privateKey required');

    // Process private key if provided - handle escaped newlines from .env
    let processedPrivateKey = privateKey;
    if (privateKey) {
      processedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }

    const creds = { 
      host, 
      port: parseInt(port, 10), 
      username, 
      password, 
      privateKey: processedPrivateKey 
    };
    const token = crypto.randomUUID();
    const encrypted = encrypt(creds);

    sessionStore.set(token, {
      payload: encrypted,
      expiry: Date.now() + 60_000, // 60 second TTL — used once for WS upgrade
      used: false
    });

    return token;
  },

  /**
   * Consume a session token (one-time use) and return decrypted creds.
   * Throws if token invalid, expired, or already used.
   */
  consumeSession(token) {
    const session = sessionStore.get(token);
    if (!session) throw new Error('Invalid or expired session token');
    if (session.expiry < Date.now()) {
      sessionStore.delete(token);
      throw new Error('Session token expired');
    }
    if (session.used) throw new Error('Session token already used');

    // Mark as used — prevents replay
    session.used = true;
    return decrypt(session.payload);
  },

  /**
   * Create an SSH shell and pipe it to WebSocket.
   * ws: the WebSocket connection object
   * creds: { host, port, username, password?, privateKey? }
   */
  attachSSHToWebSocket(ws, creds) {
    const conn = new SSHClient();

    conn.on('ready', () => {
      ws.send(JSON.stringify({ type: 'status', message: '✓ Connected to EC2 instance' }));

      conn.shell({ term: 'xterm-256color', cols: 220, rows: 50 }, (err, stream) => {
        if (err) {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
          conn.end();
          return;
        }

        // SSH → Browser
        stream.on('data', (data) => {
          if (ws.readyState === 1 /* OPEN */) {
            ws.send(JSON.stringify({ type: 'output', data: data.toString('utf8') }));
          }
        });

        stream.stderr.on('data', (data) => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'output', data: data.toString('utf8') }));
          }
        });

        // Browser → SSH
        ws.on('message', (raw) => {
          try {
            const msg = JSON.parse(raw);
            if (msg.type === 'input' && stream.writable) {
              stream.write(msg.data);
            }
            if (msg.type === 'resize') {
              stream.setWindow(msg.rows || 50, msg.cols || 220);
            }
          } catch (_) {}
        });

        stream.on('close', () => {
          ws.send(JSON.stringify({ type: 'status', message: 'SSH session closed' }));
          ws.close();
          conn.end();
        });

        ws.on('close', () => {
          stream.close();
          conn.end();
        });
      });
    });

    conn.on('error', (err) => {
      ws.send(JSON.stringify({ type: 'error', message: `SSH Error: ${err.message}` }));
      ws.close();
    });

    const sshConfig = {
      host: creds.host,
      port: creds.port,
      username: creds.username,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
    };

    if (creds.privateKey) {
      sshConfig.privateKey = creds.privateKey;
    } else {
      sshConfig.password = creds.password;
    }

    conn.connect(sshConfig);
    return conn;
  }
};
