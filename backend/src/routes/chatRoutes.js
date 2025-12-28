import express from 'express';
import {
  getChatHistory,
  addChatMessage
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/:clientId', getChatHistory);
router.post('/', addChatMessage);

export default router;
