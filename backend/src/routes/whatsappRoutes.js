import express from 'express';
import {
  getWhatsAppStatus,
  sendWhatsAppMessage,
  refreshWhitelist
} from '../controllers/whatsappController.js';

const router = express.Router();

router.get('/status', getWhatsAppStatus);
router.post('/send', sendWhatsAppMessage);
router.post('/refresh-whitelist', refreshWhitelist);

export default router;
