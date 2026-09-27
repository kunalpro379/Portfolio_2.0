import { AgentService } from './agent.service.js';

export const AgentController = {
  getStatus: async (req, res, next) => {
    try {
      const status = await AgentService.checkStatus();
      res.json({ success: true, app: 'agent', status });
    } catch (err) {
      next(err);
    }
  },
  
  processData: async (req, res, next) => {
    try {
      const { messages, currentFileContext } = req.body;
      
      // Setup SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const onProgress = (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      };

      await AgentService.handleChat(messages, currentFileContext, onProgress);
      res.end();
    } catch (err) {
      next(err);
    }
  }
};