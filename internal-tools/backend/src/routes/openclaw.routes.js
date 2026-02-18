import { Router } from 'express';
import { chat, confirm } from '../controllers/openclaw.controller.js';

const router = Router();

router.post('/chat', chat);
router.post('/confirm', confirm);

export default router;
