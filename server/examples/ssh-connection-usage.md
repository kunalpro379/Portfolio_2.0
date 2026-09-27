# AWS EC2 SSH Connection - Usage Guide

## Overview
Your Portfolio 2.0 now has secure SSH terminal connection to AWS EC2 instances with three authentication methods:

1. **Portfolio Authentication** - Uses your portfolio login + AWS defaults
2. **Direct SSH Credentials** - Provide SSH details directly  
3. **Quick Connect** - Simple password-based connection

## Required AWS Setup

### 1. Environment Variables (.env)
```env
# Required for session encryption
EC2_SESSION_SECRET=your-64-char-random-hex

# AWS EC2 Configuration (for portfolio-auth method)
AWS_EC2_DEFAULT_HOST=your-ec2-public-ip
AWS_EC2_DEFAULT_USERNAME=ec2-user

# Optional: SSH Key Authentication (more secure than password)
AWS_EC2_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
your-private-key-content-here
-----END RSA PRIVATE KEY-----
```

### 2. AWS EC2 Security Group
Ensure your EC2 security group allows SSH (port 22) from your IP:
```
Type: SSH
Protocol: TCP
Port Range: 22
Source: Your IP address or 0.0.0.0/0 (less secure)
```

## API Endpoints

### 1. Portfolio Authentication (Recommended)
```javascript
// Authenticate using portfolio credentials
const response = await fetch('/api/apps/ec2/portfolio-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'your-portfolio-username',
    password: 'your-portfolio-password',
    // Optional: override default SSH config
    sshConfig: {
      host: 'custom-ec2-host',
      username: 'ubuntu',
      sshPassword: 'ssh-specific-password' // if different from portfolio password
    }
  })
});

const { token, wsUrl } = await response.json();
```

### 2. Direct SSH Credentials
```javascript
// Use SSH credentials directly
const response = await fetch('/api/apps/ec2/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host: 'your-ec2-public-ip',
    port: 22,
    username: 'ec2-user',
    password: 'your-ssh-password'
    // OR use privateKey: 'your-private-key-content'
  })
});
```

### 3. Test Connection
```javascript
// Test SSH connection before connecting
const testResult = await fetch('/api/apps/ec2/test-connection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host: 'your-ec2-ip',
    username: 'ec2-user',
    password: 'your-password'
  })
});
```

## WebSocket Terminal Connection

```javascript
// After getting a session token, connect via WebSocket
const ws = new WebSocket(`ws://localhost:5000/ws/ec2?token=${token}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'output':
      // Display terminal output
      terminal.write(message.data);
      break;
    case 'status':
      console.log('Status:', message.message);
      break;
    case 'error':
      console.error('SSH Error:', message.message);
      break;
  }
};

// Send commands to terminal
ws.send(JSON.stringify({
  type: 'input',
  data: 'ls -la\n'  // Commands must end with \n
}));

// Handle terminal resize
ws.send(JSON.stringify({
  type: 'resize',
  rows: 30,
  cols: 120
}));
```

## Frontend Integration Example

```jsx
import React, { useState, useRef, useEffect } from 'react';

function EC2Terminal() {
  const [connected, setConnected] = useState(false);
  const [output, setOutput] = useState('');
  const [command, setCommand] = useState('');
  const wsRef = useRef(null);

  const connectToEC2 = async () => {
    try {
      // Use portfolio authentication
      const authResponse = await fetch('/api/apps/ec2/portfolio-auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Your portfolio token
        },
        body: JSON.stringify({
          username: 'your-username',
          password: 'your-password'
        })
      });

      const { success, token, wsUrl } = await authResponse.json();
      
      if (!success) {
        throw new Error('Authentication failed');
      }

      // Connect to WebSocket
      wsRef.current = new WebSocket(`ws://localhost:5000${wsUrl}`);
      
      wsRef.current.onopen = () => {
        setConnected(true);
        setOutput(prev => prev + '\\n🔗 Connected to EC2 terminal\\n');
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'output') {
          setOutput(prev => prev + message.data);
        }
      };

      wsRef.current.onclose = () => {
        setConnected(false);
        setOutput(prev => prev + '\\n❌ Connection closed\\n');
      };

    } catch (error) {
      console.error('Connection failed:', error);
      setOutput(prev => prev + `\\n❌ Error: ${error.message}\\n`);
    }
  };

  const sendCommand = () => {
    if (wsRef.current && command.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'input',
        data: command + '\\n'
      }));
      setCommand('');
    }
  };

  return (
    <div className="ec2-terminal">
      <div className="terminal-header">
        <button onClick={connectToEC2} disabled={connected}>
          {connected ? '✅ Connected' : '🔌 Connect to EC2'}
        </button>
      </div>
      
      <div className="terminal-output" style={{
        background: '#000',
        color: '#00ff00',
        fontFamily: 'monospace',
        padding: '10px',
        height: '400px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {output}
      </div>
      
      <div className="terminal-input">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendCommand()}
          placeholder="Enter command..."
          disabled={!connected}
          style={{
            width: '100%',
            background: '#000',
            color: '#00ff00',
            border: '1px solid #333',
            padding: '5px',
            fontFamily: 'monospace'
          }}
        />
      </div>
    </div>
  );
}

export default EC2Terminal;
```

## Security Features

1. **Session Encryption**: All credentials encrypted with AES-256-GCM
2. **One-time Tokens**: Session tokens expire in 60 seconds and are single-use
3. **No Persistence**: SSH credentials never stored on disk or database
4. **Memory Only**: Encrypted credentials held in memory only during session
5. **Auto Cleanup**: Expired sessions automatically removed every 30 seconds

## AWS Best Practices

1. **Use SSH Keys**: More secure than password authentication
2. **Restrict Security Groups**: Only allow SSH from your IP addresses
3. **Regular Key Rotation**: Rotate SSH keys periodically
4. **Monitor Access**: Use AWS CloudTrail to monitor SSH connections
5. **Use IAM**: Consider AWS Systems Manager Session Manager for even better security

## Troubleshooting

### Connection Fails
- Check EC2 security group allows SSH (port 22)
- Verify EC2 instance is running and reachable
- Ensure correct username (ec2-user, ubuntu, admin)
- Check private key format and permissions

### Authentication Fails
- Verify portfolio credentials are correct
- Check AWS_EC2_DEFAULT_HOST environment variable
- Ensure SSH password/key is correct for EC2 instance

### WebSocket Issues
- Check browser WebSocket support
- Verify session token hasn't expired (60s limit)
- Ensure WebSocket URL is correct (/ws/ec2?token=...)