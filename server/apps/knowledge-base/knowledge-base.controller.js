import { KnowledgebaseService } from './knowledge-base.service.js';

export const KnowledgebaseController = {
  getStatus: async (req, res, next) => {
    try {
      const status = await KnowledgebaseService.checkStatus();
      res.json({ success: true, app: 'knowledge-base', status });
    } catch (err) {
      next(err);
    }
  },
  
  processData: async (req, res, next) => {
    try {
      res.json({ success: true, message: 'knowledge-base processed successfully' });
    } catch (err) {
      next(err);
    }
  }
};