import express from 'express';
import { CodingController } from './coding.controller.js';
import { CodingAgentService } from './coding.agent.js';

const router = express.Router();

router.get('/folders', CodingController.getFolders);
router.get('/files', CodingController.getFiles);
router.get('/file/:fileId', CodingController.getFileById);
router.post('/folder/create', CodingController.createFolder);
router.delete('/folder/:folderId', CodingController.deleteFolder);
router.post('/file/create', CodingController.createFile);
router.post('/file/update', CodingController.updateFile);
router.put('/file/update', CodingController.updateFile);
router.delete('/file/:fileId', CodingController.deleteFile);
router.post('/execute', CodingController.execute);
router.post('/github/import', CodingController.importGithubRepo);

// AI Chatbot endpoint
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, currentFileContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }
    
    const reply = await CodingAgentService.handleChat(messages, currentFileContext);
    res.json({ reply });
  } catch (err) {
    console.error('Coding Agent Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;