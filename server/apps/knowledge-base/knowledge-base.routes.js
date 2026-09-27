import express from 'express';
import { KnowledgebaseController } from './knowledge-base.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', KnowledgebaseController.getStatus);
router.post('/process', KnowledgebaseController.processData);

export default router;