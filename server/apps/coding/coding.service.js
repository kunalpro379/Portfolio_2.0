import { BlobServiceClient } from '@azure/storage-blob';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'code';
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'Portfolio';

let blobServiceClient;
let containerClient;

export const CodingService = {
  async initBlobStorage() {
    if (!AZURE_STORAGE_CONNECTION_STRING) return false;
    try {
      blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
      await containerClient.createIfNotExists({ access: 'blob' });
      return true;
    } catch (error) {
      console.error('Error initializing Azure Blob Storage for Code App:', error);
      return false;
    }
  },

  generateId() {
    return `code_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  },

  getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map = {
      'js': 'javascript', 'ts': 'typescript', 'py': 'python',
      'java': 'java', 'cpp': 'c++', 'c': 'c', 'cs': 'csharp',
      'go': 'go', 'rs': 'rust', 'ipynb': 'ipynb', 'json': 'json',
      'md': 'markdown'
    };
    return map[ext] || 'plaintext';
  },

  async getFolders(parentPath = '', source = null) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const query = { parentPath };
      if (source) {
        if (source === 'local') {
          query.$or = [{ source: 'local' }, { source: null }, { source: { $exists: false } }];
        } else {
          query.source = source;
        }
      }
      return await db.collection('codeFolders').find(query).sort({ createdAt: -1 }).toArray();
    } finally {
      await client.close();
    }
  },

  async getFiles(folderPath, extension = null) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const query = {};
      if (folderPath !== undefined && folderPath !== null && folderPath !== 'all') {
        query.folderPath = folderPath;
      }
      if (extension) {
        query.filename = { $regex: `\\.${extension}$`, $options: 'i' };
      }
      return await db.collection('codeFiles').find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
    } finally {
      await client.close();
    }
  },

  async getFileById(fileId) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      return await db.collection('codeFiles').findOne({ fileId });
    } finally {
      await client.close();
    }
  },

  async createFile({ filename, folderPath, content = '', language }) {
    const fileId = this.generateId();
    const detectedLang = language || this.getLanguageFromExtension(filename);
    let blobUrl = '';
    
    if (containerClient) {
      try {
        const blobName = `${folderPath}/${fileId}_${filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const contentType = filename.endsWith('.ipynb') ? 'application/x-ipynb+json' : 'text/plain';
        await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
          blobHTTPHeaders: { blobContentType: contentType }
        });
        blobUrl = blockBlobClient.url;
      } catch (err) {
        console.error('Blob upload error:', err);
      }
    }

    const fileData = {
      fileId, filename, folderPath, content, language: detectedLang,
      size: Buffer.byteLength(content, 'utf8'), blobUrl,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };

    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      await db.collection('codeFiles').insertOne(fileData);
      return fileData;
    } finally {
      await client.close();
    }
  },

  async updateFile({ fileId, content, filename, folderPath }) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const existing = await db.collection('codeFiles').findOne({ fileId });
      if (!existing) {
        throw new Error(`File ${fileId} not found`);
      }

      let blobUrl = existing.blobUrl;
      const targetFilename = filename || existing.filename;
      const targetFolderPath = folderPath !== undefined ? folderPath : existing.folderPath;

      if (containerClient && content !== undefined) {
        try {
          const blobName = `${targetFolderPath}/${fileId}_${targetFilename}`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const contentType = targetFilename.endsWith('.ipynb') ? 'application/x-ipynb+json' : 'text/plain';
          await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
            blobHTTPHeaders: { blobContentType: contentType }
          });
          blobUrl = blockBlobClient.url;
        } catch (err) {
          console.error('Blob update error:', err);
        }
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };
      if (content !== undefined) {
        updateData.content = content;
        updateData.size = Buffer.byteLength(content, 'utf8');
      }
      if (blobUrl) updateData.blobUrl = blobUrl;
      if (filename) {
        updateData.filename = filename;
        updateData.language = this.getLanguageFromExtension(filename);
      }
      if (folderPath !== undefined) {
        updateData.folderPath = folderPath;
      }

      await db.collection('codeFiles').updateOne({ fileId }, { $set: updateData });
      return { ...existing, ...updateData };
    } finally {
      await client.close();
    }
  },

  async deleteFile(fileId) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const existing = await db.collection('codeFiles').findOne({ fileId });
      if (existing && containerClient) {
        try {
          const blobName = `${existing.folderPath}/${fileId}_${existing.filename}`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.deleteIfExists();
        } catch (err) {
          console.error('Blob delete error:', err);
        }
      }
      await db.collection('codeFiles').deleteOne({ fileId });
      return { success: true, fileId };
    } finally {
      await client.close();
    }
  },

  async createFolder({ name, parentPath = '', source = 'local' }) {
    const folderId = this.generateId();
    const path = parentPath ? `${parentPath}/${name}` : name;
    const folderData = {
      folderId, name, path, parentPath, source,
      createdAt: new Date().toISOString()
    };

    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      await db.collection('codeFolders').insertOne(folderData);
      return folderData;
    } finally {
      await client.close();
    }
  },

  async deleteFolder(folderId) {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DATABASE_NAME);
      const folder = await db.collection('codeFolders').findOne({ folderId });
      if (folder) {
        // Also remove files in folder and subfolders
        const filesToDelete = await db.collection('codeFiles').find({
          $or: [
            { folderPath: folder.path },
            { folderPath: { $regex: `^${folder.path}/` } }
          ]
        }).toArray();

        if (containerClient) {
          for (const f of filesToDelete) {
            try {
              const blobName = `${f.folderPath}/${f.fileId}_${f.filename}`;
              const blockBlobClient = containerClient.getBlockBlobClient(blobName);
              await blockBlobClient.deleteIfExists();
            } catch (e) {
              // ignore individual blob delete errors
            }
          }
        }

        await db.collection('codeFiles').deleteMany({
          $or: [
            { folderPath: folder.path },
            { folderPath: { $regex: `^${folder.path}/` } }
          ]
        });

        await db.collection('codeFolders').deleteMany({
          $or: [
            { folderId },
            { path: { $regex: `^${folder.path}/` } }
          ]
        });
      }
      return { success: true, folderId };
    } finally {
      await client.close();
    }
  },

  async executeCode(language, content) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    const execAsync = promisify(exec);

    const tempDir = os.tmpdir();
    const fileId = Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    let filename = '';
    let command = '';
    
    try {
      if (language === 'javascript' || language === 'js') {
        filename = `temp_${fileId}.js`;
        command = `node ${filename}`;
      } else if (language === 'python' || language === 'python3') {
        filename = `temp_${fileId}.py`;
        command = `python ${filename}`;
      } else if (language === 'java') {
        filename = `Main_${fileId}.java`;
        command = `java ${filename}`;
      } else if (language === 'c++' || language === 'cpp') {
        filename = `temp_${fileId}.cpp`;
        const exeName = `temp_${fileId}.exe`;
        command = `g++ ${filename} -o ${exeName} && ${exeName}`;
      } else {
        throw new Error(`Local execution for language ${language} is not supported yet.`);
      }

      const filePath = path.join(tempDir, filename);
      await fs.writeFile(filePath, content);
      
      try {
        const { stdout, stderr } = await execAsync(command, { cwd: tempDir, timeout: 10000 });
        return { output: stdout || stderr, stdout, stderr, code: 0 };
      } catch (err) {
        return { output: err.stdout || err.stderr || err.message, stdout: err.stdout, stderr: err.stderr || err.message, code: 1 };
      }
    } catch (error) {
      console.error('Local Execution Error:', error);
      throw error;
    }
  },

  async importGithubRepo(repoUrl) {
    let owner, repo;
    try {
      if (repoUrl.includes('github.com')) {
        const parts = new URL(repoUrl).pathname.split('/').filter(Boolean);
        owner = parts[0];
        repo = parts[1];
      } else {
        const parts = repoUrl.split('/');
        owner = parts[0];
        repo = parts[1];
      }
    } catch (e) {
      throw new Error("Invalid GitHub URL format");
    }

    if (!owner || !repo) throw new Error("Could not parse owner and repo");

    // Create root folder
    const repoRootFolder = await this.createFolder({ name: repo, parentPath: '', source: 'github' });
    const headers = { 'User-Agent': 'Portfolio-App' };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    // Fetch tree - try main branch first, then master
    let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    console.log('[GitHub Import] Fetching tree from:', treeUrl);
    console.log('[GitHub Import] Token present:', !!process.env.GITHUB_TOKEN);
    let res = await fetch(treeUrl, { headers });
    console.log('[GitHub Import] main branch status:', res.status);
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.log('[GitHub Import] main branch error:', JSON.stringify(errBody));
        treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        res = await fetch(treeUrl, { headers });
        console.log('[GitHub Import] master branch status:', res.status);
    }
    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.log('[GitHub Import] master branch error:', JSON.stringify(errBody));
        throw new Error(`Could not fetch repo tree from GitHub: ${errBody.message || res.status}`);
    }

    const data = await res.json();
    const tree = data.tree || [];

    // Filter to avoid unneeded folders, but import ALL files in the background
    const files = tree.filter(t => t.type === 'blob' && !t.path.includes('node_modules') && !t.path.includes('.git') && !t.path.includes('dist') && !t.path.includes('build'));
    const folders = tree.filter(t => t.type === 'tree' && !t.path.includes('node_modules') && !t.path.includes('.git') && !t.path.includes('dist') && !t.path.includes('build'));

    // Create all nested folders sequentially right now so the structure exists
    for (const f of folders) {
      const parts = f.path.split('/');
      const name = parts.pop();
      const parentPath = parts.length > 0 ? `${repoRootFolder.path}/${parts.join('/')}` : repoRootFolder.path;
      await this.createFolder({ name, parentPath, source: 'github' });
    }

    // Fetch and save file contents in the background (no await)
    (async () => {
      try {
        console.log(`Starting background import of ${files.length} files for ${repo}...`);
        for (let i = 0; i < files.length; i += 10) {
          const batch = files.slice(i, i + 10);
          await Promise.all(batch.map(async (f) => {
            const parts = f.path.split('/');
            const filename = parts.pop();
            const parentPath = parts.length > 0 ? `${repoRootFolder.path}/${parts.join('/')}` : repoRootFolder.path;
            
            let rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${f.path}`;
            let rawRes = await fetch(rawUrl, { headers });
            if (!rawRes.ok) rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${f.path}`;
            rawRes = await fetch(rawUrl, { headers });
            
            if (rawRes.ok) {
              const content = await rawRes.text();
              // This automatically uploads to Blob and Mongo properly
              await this.createFile({ filename, folderPath: parentPath, content });
            }
          }));
        }
        console.log(`Successfully imported all ${files.length} files for ${repo}!`);
      } catch (err) {
        console.error(`Background import failed for ${repo}:`, err);
      }
    })();

    return { message: `Started importing ${files.length} files into ${repoRootFolder.name} in the background. They will appear shortly!`, folder: repoRootFolder };
  }
};

CodingService.initBlobStorage();