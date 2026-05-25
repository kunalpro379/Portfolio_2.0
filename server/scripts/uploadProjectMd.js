import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { BlobServiceClient } from '@azure/storage-blob';
import Project from '../models/Project.js';

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;
const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER_NAME || 'notes';

async function run() {
  if (!MONGO_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }
  if (!AZURE_CONNECTION_STRING) {
    console.error('AZURE_STORAGE_CONNECTION_STRING is not defined in .env');
    process.exit(1);
  }

  const projectId = 'rinkM8mEXa';
  const mdFilePath = path.join(__dirname, '../data/collaborative-cloud-code-editor.md');

  if (!fs.existsSync(mdFilePath)) {
    console.error(`MD file not found at: ${mdFilePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(mdFilePath);
  const filename = `${projectId}-content.md`;
  const blobPath = `projects/${projectId}/${filename}`;

  console.log('Uploading markdown to Azure Blob Storage...');
  console.log(`Blob path: ${blobPath}`);

  try {
    // 1. Upload to Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: 'text/markdown' }
    });

    const blobUrl = blockBlobClient.url;
    console.log(`✓ Uploaded to Azure successfully! URL: ${blobUrl}`);

    // 2. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { dbName: 'Portfolio' });
    console.log('✓ Connected to MongoDB.');

    // 3. Update Project
    const project = await Project.findOne({ projectId });
    if (!project) {
      console.error(`✗ Project with ID ${projectId} not found in database.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    project.mdFiles = [blobUrl];
    project.updated_at = new Date();
    await project.save();

    console.log(`✓ Updated project "${project.title}" in database with mdFiles URL.`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('An error occurred:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

run();
