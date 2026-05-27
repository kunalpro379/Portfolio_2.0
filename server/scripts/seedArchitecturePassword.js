import dotenv from 'dotenv';
import dbConnection from '../config/database.js';
import Password from '../models/Password.js';

dotenv.config({ override: true });

const PASSWORD_KEY = 'ARCHITECTURE_PASSWORD';
const PLAIN_PASSWORD = 'Lawm@822471';

async function seedArchitecturePassword() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in environment');
    }

    await dbConnection.connect();

    const ok = await Password.setPassword(PASSWORD_KEY, PLAIN_PASSWORD);
    if (!ok) {
      throw new Error('Failed to hash/store architecture password');
    }

    console.log(`Architecture password seeded for key: ${PASSWORD_KEY}`);
    console.log('Stored securely as bcrypt hash in MongoDB (plain password is not stored).');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding architecture password:', error.message);
    process.exit(1);
  }
}

seedArchitecturePassword();
