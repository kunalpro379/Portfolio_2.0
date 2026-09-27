import { DiagramService } from './diagram.service.js';

export const DiagramController = {
  getStatus: async (req, res, next) => {
    try {
      const status = await DiagramService.checkStatus();
      res.json({ success: true, app: 'diagram', status });
    } catch (err) {
      next(err);
    }
  },
  
  processData: async (req, res, next) => {
    try {
      res.json({ success: true, message: 'diagram processed successfully' });
    } catch (err) {
      next(err);
    }
  }
};