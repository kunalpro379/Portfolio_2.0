import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Project from '../models/Project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'Portfolio' });
  const projects = await Project.find({}, { title: 1, assets: 1, cardasset: 1 });
  console.log('Projects and their assets:');
  projects.forEach(p => {
    if ((p.assets && p.assets.length > 0) || (p.cardasset && p.cardasset.length > 0)) {
      console.log(`- Title: "${p.title}"`);
      console.log(`  Assets:`, p.assets);
      console.log(`  Cardassets:`, p.cardasset);
    }
  });
  await mongoose.disconnect();
}

run();
