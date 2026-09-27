/**
 * EC2 Terminal REST Routes
 * 
 * POST /api/apps/ec2/connect        → validates creds, returns session token
 * POST /api/apps/ec2/portfolio-auth → uses portfolio auth + AWS defaults
 * POST /api/apps/ec2/test-connection → test SSH connection before connecting
 * GET  /api/apps/ec2/health         → health check
 * 
 * WebSocket upgrade is handled in ec2.ws.js (attached to HTTP server).
 */

import express from 'express';
import { EC2Service } from './ec2.service.js';
import { EC2AuthIntegration } from './auth-integration.service.js';

const router = express.Router();

/**
 * POST /api/apps/ec2/connect
 * Body: { host, port?, username, password } | { host, port?, username, privateKey }
 * Returns: { token } — one-time 60s WebSocket session token
 */
router.post('/connect', async (req, res) => {
  try {
    const { host, port = 22, username, password, privateKey } = req.body;

    if (!host || !username) {
      return res.status(400).json({ success: false, error: 'host and username are required' });
    }
    if (!password && !privateKey) {
      return res.status(400).json({ success: false, error: 'password or privateKey required' });
    }

    // All hosts and ports allowed — user controls their own EC2
    const token = EC2Service.createSession({
      host: host.trim(),
      port: parseInt(port, 10) || 22,
      username,
      password,
      privateKey
    });

    res.json({
      success: true,
      token,
      wsUrl: `/ws/ec2?token=${token}`,
      expiresInSeconds: 60,
      message: 'Session token created. Connect via WebSocket within 60 seconds.'
    });
  } catch (err) {
    console.error('[EC2] /connect error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/apps/ec2/quick-connect
 * Enhanced connect with password-only auth for your Portfolio system
 * Body: { portfolioPassword, host?, username? }
 * Returns: { token } — uses default AWS settings with portfolio auth
 */
router.post('/quick-connect', async (req, res) => {
  try {
    const { portfolioPassword, host, username } = req.body;

    if (!portfolioPassword) {
      return res.status(400).json({ success: false, error: 'Portfolio password is required' });
    }

    // You can customize these defaults for your AWS setup
    const defaultHost = host || process.env.AWS_EC2_DEFAULT_HOST;
    const defaultUsername = username || process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user';
    
    if (!defaultHost) {
      return res.status(400).json({ 
        success: false, 
        error: 'EC2 host is required. Set AWS_EC2_DEFAULT_HOST in .env or provide host in request.' 
      });
    }

    // Here you could add validation against your portfolio authentication
    // For now, using the password directly for SSH authentication
    const token = EC2Service.createSession({
      host: defaultHost.trim(),
      port: 22,
      username: defaultUsername,
      password: portfolioPassword,
      // You could also use privateKey if you prefer key-based auth:
      // privateKey: process.env.AWS_EC2_PRIVATE_KEY
    });

    res.json({
      success: true,
      token,
      wsUrl: `/ws/ec2?token=${token}`,
      expiresInSeconds: 60,
      message: `Connecting to ${defaultUsername}@${defaultHost}. WebSocket token ready.`,
      connectionInfo: {
        host: defaultHost,
        username: defaultUsername,
        port: 22
      }
    });
  } catch (err) {
    console.error('[EC2] /quick-connect error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/apps/ec2/portfolio-auth
 * Authenticate using Portfolio credentials and connect to configured AWS EC2
 * Body: { username, password, sshConfig? }
 * Returns: { token, connectionInfo } — ready for WebSocket upgrade
 */
router.post('/portfolio-auth', async (req, res) => {
  try {
    const { username, password, sshConfig = {} } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Portfolio username and password are required' 
      });
    }

    const result = await EC2AuthIntegration.authenticateAndConnect(username, password, sshConfig);

    res.json({
      success: true,
      token: result.token,
      wsUrl: `/ws/ec2?token=${result.token}`,
      expiresInSeconds: 60,
      connectionInfo: result.connectionInfo,
      message: `Portfolio authentication successful. EC2 session ready for ${result.connectionInfo.username}@${result.connectionInfo.host}`
    });

  } catch (err) {
    console.error('[EC2] /portfolio-auth error:', err.message);
    
    // Don't expose internal errors for security
    const message = err.message.includes('portfolio credentials') 
      ? 'Invalid portfolio credentials' 
      : 'EC2 connection setup failed';
      
    res.status(401).json({ success: false, error: message });
  }
});

/**
 * POST /api/apps/ec2/test-connection
 * Test SSH connection without creating a session
 * Body: { host, port?, username, password } | { host, port?, username, privateKey }
 * Returns: { success, message } — connection test result
 */
router.post('/test-connection', async (req, res) => {
  try {
    const { host, port = 22, username, password, privateKey } = req.body;

    if (!host || !username) {
      return res.status(400).json({ success: false, error: 'host and username are required' });
    }
    if (!password && !privateKey) {
      return res.status(400).json({ success: false, error: 'password or privateKey required' });
    }

    await EC2AuthIntegration.testConnection({ host, port, username, password, privateKey });

    res.json({
      success: true,
      message: `Successfully connected to ${username}@${host}:${port}`,
      connectionInfo: { host, port: parseInt(port, 10), username }
    });

  } catch (err) {
    console.error('[EC2] /test-connection error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/apps/ec2/config
 * Get available EC2 connection configuration
 * Returns: { defaultHost, defaultUsername, authMethods }
 */
router.get('/config', (req, res) => {
  const config = {
    defaultHost: process.env.AWS_EC2_DEFAULT_HOST || null,
    defaultUsername: process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user',
    authMethods: {
      password: true,
      privateKey: !!process.env.AWS_EC2_PRIVATE_KEY,
      portfolioAuth: true
    },
    features: {
      portfolioIntegration: true,
      connectionTesting: true,
      sessionEncryption: true
    }
  };

  res.json({ success: true, config });
});

/**
 * GET /api/apps/ec2/health
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'ec2-terminal', 
    status: 'ready',
    features: ['ssh2', 'websocket', 'portfolio-auth', 'session-encryption']
  });
});

export default router;
