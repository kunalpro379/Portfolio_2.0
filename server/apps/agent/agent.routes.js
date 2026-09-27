import express from 'express';
import { AgentController } from './agent.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', AgentController.getStatus);
router.post('/process', AgentController.processData);

export default router;