import { Router } from 'express';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getWorkload,
  getCalendar
} from '../controllers/techsprint.controller.js';

const router = Router();

router.get('/workload', getWorkload);
router.get('/calendar', getCalendar);
router.get('/tasks', listTasks);
router.post('/tasks', createTask);
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
