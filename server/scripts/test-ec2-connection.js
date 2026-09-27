#!/usr/bin/env node
/**
 * EC2 SSH Connection Test Script
 * 
 * Usage: node scripts/test-ec2-connection.js
 * 
 * Tests EC2 SSH connectivity and authentication methods
 */

import dotenv from 'dotenv';
import { EC2AuthIntegration } from '../apps/ec2/auth-integration.service.js';
import { EC2Service } from '../apps/ec2/ec2.service.js';

dotenv.config();

async function testEC2Connection() {
  console.log('🔧 EC2 SSH Connection Test\n');
  
  // Check environment configuration
  console.log('📋 Environment Configuration:');
  console.log(`   EC2_SESSION_SECRET: ${process.env.EC2_SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AWS_EC2_DEFAULT_HOST: ${process.env.AWS_EC2_DEFAULT_HOST || '❌ Not set'}`);
  console.log(`   AWS_EC2_DEFAULT_USERNAME: ${process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user (default)'}`);
  console.log(`   AWS_EC2_PRIVATE_KEY: ${process.env.AWS_EC2_PRIVATE_KEY ? '✅ Set' : '❌ Not set'}\n`);

  // Test 1: Session Creation
  console.log('🧪 Test 1: Session Token Creation');
  try {
    const testCredentials = {
      host: process.env.AWS_EC2_DEFAULT_HOST || 'test-host',
      port: 22,
      username: process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user',
      password: 'test-password'
    };

    const token = EC2Service.createSession(testCredentials);
    console.log(`   ✅ Session token created: ${token.substring(0, 8)}...`);
    
    // Test token consumption
    const retrievedCreds = EC2Service.consumeSession(token);
    console.log(`   ✅ Token consumed successfully`);
    console.log(`   📡 Host: ${retrievedCreds.host}`);
    console.log(`   👤 Username: ${retrievedCreds.username}\n`);
  } catch (error) {
    console.log(`   ❌ Session test failed: ${error.message}\n`);
  }

  // Test 2: Direct Connection Test (if configured)
  if (process.env.AWS_EC2_DEFAULT_HOST) {
    console.log('🔌 Test 2: Direct SSH Connection Test');
    try {
      const testCredentials = {
        host: process.env.AWS_EC2_DEFAULT_HOST,
        port: 22,
        username: process.env.AWS_EC2_DEFAULT_USERNAME || 'ec2-user',
      };

      // Add authentication method
      if (process.env.AWS_EC2_PRIVATE_KEY) {
        testCredentials.privateKey = process.env.AWS_EC2_PRIVATE_KEY;
        console.log('   🔐 Testing with SSH private key...');
      } else {
        // For testing, we'll skip actual connection without credentials
        console.log('   ⚠️  No private key configured, skipping actual connection test');
        console.log('   💡 Add AWS_EC2_PRIVATE_KEY to .env for real connection testing\n');
        return;
      }

      // Test actual connection
      await EC2AuthIntegration.testConnection(testCredentials);
      console.log(`   ✅ SSH connection successful to ${testCredentials.host}`);
      console.log(`   🎉 Ready for WebSocket terminal sessions!\n`);

    } catch (error) {
      console.log(`   ❌ SSH connection failed: ${error.message}`);
      console.log('   💡 Check your EC2 instance, security groups, and credentials\n');
    }
  } else {
    console.log('🔌 Test 2: SSH Connection Test');
    console.log('   ⚠️  AWS_EC2_DEFAULT_HOST not configured');
    console.log('   💡 Add your EC2 public IP to .env for connection testing\n');
  }

  // Test 3: Configuration Check
  console.log('⚙️  Test 3: Configuration Summary');
  console.log('   Available authentication methods:');
  console.log(`   • Password authentication: ✅ Available`);
  console.log(`   • SSH key authentication: ${process.env.AWS_EC2_PRIVATE_KEY ? '✅' : '❌'} ${process.env.AWS_EC2_PRIVATE_KEY ? 'Available' : 'Not configured'}`);
  console.log(`   • Portfolio integration: ✅ Available`);
  
  console.log('\n🚀 Next Steps:');
  if (!process.env.AWS_EC2_DEFAULT_HOST) {
    console.log('   1. Add your EC2 public IP to AWS_EC2_DEFAULT_HOST in .env');
  }
  if (!process.env.AWS_EC2_PRIVATE_KEY) {
    console.log('   2. (Optional) Add your .pem key content to AWS_EC2_PRIVATE_KEY for key-based auth');
  }
  console.log('   3. Test connection from your frontend using the API endpoints');
  console.log('   4. Check examples/ssh-connection-usage.md for implementation details');
}

// Run the test
testEC2Connection().catch(console.error);