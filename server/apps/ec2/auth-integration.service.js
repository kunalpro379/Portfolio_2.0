/**
 * EC2 Authentication Integration Service
 * 
 * Integrates EC2 SSH connections with Portfolio authentication system.
 * Provides secure, user-friendly SSH access using portfolio credentials.
 */

import bcrypt from 'bcryptjs';
import { Client } from 'ssh2';
import User from '../../models/User.js';
import { EC2Service } from './ec2.service.js';

export const EC2AuthIntegration = {
  /**
   * Authenticate portfolio user and create EC2 SSH session
   * @param {string} username - Portfolio username
   * @param {string} password - Portfolio password (also used for SSH)
   * @param {object} sshConfig - Optional SSH configuration override
   * @returns {Promise<string>} Session token for WebSocket upgrade
   */
  async authenticateAndConnect(username, password, sshConfig = {}) {
    // Validate portfolio credentials
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid portfolio credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid portfolio credentials');
    }

    // Get SSH configuration - use defaults from environment if not provided
    const host = sshConfig.host || process.env.AWS_EC2_DEFAULT_HOST;
    const sshUsername = sshConfig.username || process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user';
    const sshPort = sshConfig.port || 22;

    if (!host) {
      throw new Error('EC2 host configuration required. Set AWS_EC2_DEFAULT_HOST in environment.');
    }

    // Determine authentication method
    let authConfig = {};
    
    if (process.env.AWS_EC2_PRIVATE_KEY) {
      // Use SSH key authentication (more secure) - handle escaped newlines
      authConfig.privateKey = process.env.AWS_EC2_PRIVATE_KEY.replace(/\\n/g, '\n');
    } else {
      // Use password authentication (using portfolio password or SSH-specific password)
      authConfig.password = sshConfig.sshPassword || password;
    }

    // Create encrypted session token
    const token = EC2Service.createSession({
      host: host.trim(),
      port: parseInt(sshPort, 10),
      username: sshUsername,
      ...authConfig
    });

    return {
      token,
      connectionInfo: {
        host,
        username: sshUsername,
        port: sshPort,
        authMethod: authConfig.privateKey ? 'key' : 'password'
      }
    };
  },

  /**
   * Create EC2 session with custom credentials (direct method)
   * @param {object} credentials - Direct SSH credentials
   * @returns {string} Session token
   */
  createDirectSession(credentials) {
    const { host, port = 22, username, password, privateKey } = credentials;

    if (!host || !username) {
      throw new Error('Host and username are required');
    }
    if (!password && !privateKey) {
      throw new Error('Password or private key required');
    }

    // Process private key if provided - handle escaped newlines
    let processedPrivateKey = privateKey;
    if (privateKey) {
      processedPrivateKey = privateKey.replace(/\\n/g, '\n');
    }

    return EC2Service.createSession({
      host: host.trim(),
      port: parseInt(port, 10),
      username,
      password,
      privateKey: processedPrivateKey
    });
  },

  /**
   * Validate SSH connection before creating session
   * @param {object} credentials - SSH credentials to test
   * @returns {Promise<boolean>} Connection test result
   */
  testConnection(credentials) {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      const timeout = setTimeout(() => {
        conn.end();
        reject(new Error('Connection timeout'));
      }, 10000);

      conn.on('ready', () => {
        clearTimeout(timeout);
        conn.end();
        resolve(true);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`SSH connection failed: ${err.message}`));
      });

      const config = {
        host: credentials.host,
        port: credentials.port || 22,
        username: credentials.username,
        readyTimeout: 8000,
      };

      if (credentials.privateKey) {
        // Handle escaped newlines in private key
        config.privateKey = credentials.privateKey.replace(/\\n/g, '\n');
      } else {
        config.password = credentials.password;
      }

      conn.connect(config);
    });
  }
};