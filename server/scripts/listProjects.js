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
  const projects = await Project.find({}, { title: 1, projectId: 1, slug: 1 });
  console.log('Projects in database:');
  projects.forEach(p => {
    console.log(`- Title: "${p.title}" | ID: "${p.projectId}" | Slug: "${p.slug}"`);
  });
  await mongoose.disconnect();
}

run();
