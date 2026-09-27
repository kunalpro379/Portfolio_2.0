import express from 'express';
import agentRoutes from './agent/agent.routes.js';
import diagramRoutes from './diagram/diagram.routes.js';
import codingRoutes from './coding/coding.routes.js';
import knowledgeBaseRoutes from './knowledge-base/knowledge-base.routes.js';
import ec2Routes from './ec2/ec2.routes.js';

const router = express.Router();

router.use('/agent', agentRoutes);
router.use('/diagram', diagramRoutes);
router.use('/coding', codingRoutes);
router.use('/knowledge-base', knowledgeBaseRoutes);
router.use('/ec2', ec2Routes);

export default router;