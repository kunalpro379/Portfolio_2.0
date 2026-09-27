import express from 'express';
import { DiagramController } from './diagram.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', DiagramController.getStatus);
router.post('/process', DiagramController.processData);

export default router;