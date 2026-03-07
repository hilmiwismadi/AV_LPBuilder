import { Router } from 'express';
import {
  listDeadlines,
  getCalendarFeed,
  createDeadline,
  updateDeadline,
  deleteDeadline,
} from '../controllers/deadline.controller.js';

const router = Router();

router.get('/calendar', getCalendarFeed);
router.get('/', listDeadlines);
router.post('/', createDeadline);
router.patch('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

export default router;
