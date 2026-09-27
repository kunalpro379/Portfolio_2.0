import { CodingService } from './coding.service.js';

export const CodingController = {
  getFolders: async (req, res, next) => {
    try {
      const folders = await CodingService.getFolders(req.query.parentPath || '', req.query.source || null);
      res.json({ success: true, folders });
    } catch (err) {
      next(err);
    }
  },

  getFiles: async (req, res, next) => {
    try {
      const files = await CodingService.getFiles(req.query.folderPath, req.query.extension || null);
      res.json({ success: true, files });
    } catch (err) {
      next(err);
    }
  },

  getFileById: async (req, res, next) => {
    try {
      const file = await CodingService.getFileById(req.params.fileId);
      if (!file) return res.status(404).json({ success: false, error: 'File not found' });
      res.json({ success: true, file });
    } catch (err) {
      next(err);
    }
  },

  createFile: async (req, res, next) => {
    try {
      const { filename, folderPath, content, language } = req.body;
      const result = await CodingService.createFile({ filename, folderPath, content, language });
      res.json({ success: true, file: result });
    } catch (err) {
      next(err);
    }
  },

  updateFile: async (req, res, next) => {
    try {
      const { fileId, content, filename, folderPath } = req.body;
      const targetId = fileId || req.params.fileId;
      if (!targetId) return res.status(400).json({ success: false, error: 'fileId is required' });
      const result = await CodingService.updateFile({ fileId: targetId, content, filename, folderPath });
      res.json({ success: true, file: result });
    } catch (err) {
      next(err);
    }
  },

  deleteFile: async (req, res, next) => {
    try {
      const fileId = req.params.fileId || req.body.fileId;
      if (!fileId) return res.status(400).json({ success: false, error: 'fileId is required' });
      const result = await CodingService.deleteFile(fileId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  createFolder: async (req, res, next) => {
    try {
      const { name, parentPath } = req.body;
      const result = await CodingService.createFolder({ name, parentPath });
      res.json({ success: true, folder: result });
    } catch (err) {
      next(err);
    }
  },

  deleteFolder: async (req, res, next) => {
    try {
      const folderId = req.params.folderId || req.body.folderId;
      if (!folderId) return res.status(400).json({ success: false, error: 'folderId is required' });
      const result = await CodingService.deleteFolder(folderId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  execute: async (req, res, next) => {
    try {
      const { language, content } = req.body;
      if (!language || !content) {
        return res.status(400).json({ success: false, error: 'Language and content are required' });
      }
      
      const result = await CodingService.executeCode(language, content);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Execution failed', details: err.message });
    }
  },

  importGithubRepo: async (req, res, next) => {
    try {
      const { repoUrl } = req.body;
      if (!repoUrl) return res.status(400).json({ success: false, error: 'repoUrl is required' });
      
      console.log('[GitHub Import] Starting import for:', repoUrl);
      console.log('[GitHub Import] GITHUB_TOKEN present:', !!process.env.GITHUB_TOKEN);
      const result = await CodingService.importGithubRepo(repoUrl);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('[GitHub Import] ERROR:', err.message);
      res.status(500).json({ success: false, error: 'GitHub Import failed', details: err.message });
    }
  }
};