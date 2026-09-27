import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Simple User schema directly defined to avoid import path issues
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema, 'users');

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const username = process.argv[2] || 'admin';
  const plainPassword = process.argv[3] || 'kunal123'; // default password

  try {
    const options = { dbName: 'Portfolio' };
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB (Portfolio DB)');

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`User '${username}' already exists. Updating password...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log(`Password updated for user '${username}'.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      const newUser = new User({
        username,
        password: hashedPassword
      });
      await newUser.save();
      console.log(`Created new user '${username}'.`);
    }

    console.log(`User credentials set! Username: ${username}, Password: ${plainPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createAdmin();
