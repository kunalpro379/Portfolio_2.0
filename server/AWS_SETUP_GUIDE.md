# AWS EC2 SSH Setup Guide

## Quick Setup Checklist

### 1. AWS EC2 Instance Setup
- [ ] Launch an EC2 instance (any size, recommend t2.micro for testing)
- [ ] Note the **Public IP address** or **Public DNS**
- [ ] Download the `.pem` key file during instance creation
- [ ] Configure Security Group to allow SSH (port 22)

### 2. Security Group Configuration
```
Type: SSH
Protocol: TCP  
Port Range: 22
Source: Your IP address (or 0.0.0.0/0 for testing - less secure)
```

### 3. Environment Variables (.env)
```env
# Generate session secret
EC2_SESSION_SECRET=your-64-char-random-hex

# Your EC2 instance details
AWS_EC2_DEFAULT_HOST=your-ec2-public-ip-or-dns
AWS_EC2_DEFAULT_USERNAME=ec2-user

# SSH Private Key (paste your .pem file content)
AWS_EC2_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...your-private-key-content...
-----END RSA PRIVATE KEY-----
```

## Step-by-Step AWS Setup

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose AMI (Amazon Linux 2 recommended)
3. Choose Instance Type (t2.micro for testing)
4. **Create new key pair** - download the `.pem` file
5. Configure Security Group:
   - Add rule: SSH, TCP, 22, Your IP
6. Launch instance

### Step 2: Get Connection Details
1. Wait for instance to be "Running"
2. Note the **Public IPv4 address** (e.g., `54.123.45.67`)
3. Note the **Public IPv4 DNS** (e.g., `ec2-54-123-45-67.compute-1.amazonaws.com`)

### Step 3: Configure .env File
1. Open `Portfolio_2.0/server/.env`
2. Add your EC2 details:
```env
AWS_EC2_DEFAULT_HOST=54.123.45.67
AWS_EC2_DEFAULT_USERNAME=ec2-user
```

### Step 4: Add SSH Key (Recommended)
1. Open your downloaded `.pem` file in text editor
2. Copy the entire content (including BEGIN/END lines)
3. Add to `.env`:
```env
AWS_EC2_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
...your-full-key-content...
-----END RSA PRIVATE KEY-----
```

### Step 5: Test Connection
```bash
cd Portfolio_2.0/server
npm run test:ec2
```

## Common Issues & Solutions

### ❌ "Connection timeout"
- **Cause**: Security group doesn't allow SSH from your IP
- **Fix**: Add SSH rule (port 22) to security group with your IP

### ❌ "Permission denied (publickey)"
- **Cause**: Wrong username or key issues
- **Fix**: 
  - Check username (ec2-user for Amazon Linux, ubuntu for Ubuntu)
  - Verify private key format in .env
  - Ensure key corresponds to your instance

### ❌ "Host key verification failed"  
- **Cause**: SSH host key checking
- **Fix**: This is handled automatically by the ssh2 library

### ❌ "Network unreachable"
- **Cause**: Wrong IP address or instance stopped
- **Fix**: 
  - Check instance is running (not stopped/terminated)
  - Verify public IP address is correct
  - Check your internet connection

## Username by AMI Type
- **Amazon Linux**: `ec2-user`
- **Ubuntu**: `ubuntu`
- **CentOS**: `centos`
- **RHEL**: `ec2-user`
- **SUSE**: `ec2-user`
- **Debian**: `admin`

## Security Best Practices

### 1. Use SSH Keys (Not Passwords)
- More secure than password authentication
- Configure `AWS_EC2_PRIVATE_KEY` in .env
- Never commit private keys to version control

### 2. Restrict Security Group
```
Source: Your specific IP address
NOT: 0.0.0.0/0 (allows access from anywhere)
```

### 3. Regular Key Rotation
- Rotate SSH keys periodically
- Use AWS Systems Manager Session Manager for even better security

### 4. Monitor Access
- Enable AWS CloudTrail
- Monitor SSH login attempts
- Use AWS Config for compliance

## Testing Your Setup

### 1. Test via npm script:
```bash
npm run test:ec2
```

### 2. Test manually via SSH:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 3. Test via API:
```bash
curl -X POST http://localhost:5000/api/apps/ec2/test-connection \
  -H "Content-Type: application/json" \
  -d '{"host":"your-ec2-ip","username":"ec2-user","privateKey":"your-key"}'
```

## Cost Optimization

### Free Tier Limits
- t2.micro instances: 750 hours/month free
- Stop instances when not in use
- Terminate test instances to avoid charges

### Monitoring
- Set up billing alerts
- Use AWS Cost Explorer
- Consider auto-shutdown scripts

## Next Steps
1. Complete AWS setup using this guide
2. Run `npm run test:ec2` to verify connection
3. Integrate the SSH terminal in your frontend
4. Check `examples/ssh-connection-usage.md` for implementation details