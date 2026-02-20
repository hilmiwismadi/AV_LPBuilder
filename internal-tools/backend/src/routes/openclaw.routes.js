import { Router } from 'express';
import { chat, confirm, listConversations, getConversation, deleteConversation } from '../controllers/openclaw.controller.js';

const router = Router();

router.post('/chat', chat);
router.post('/confirm', confirm);
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

export default router;
