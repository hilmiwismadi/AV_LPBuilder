import express from 'express';
import {
  createEventOrganizer,
  listEventOrganizers,
  updateEventOrganizer,
  deleteEventOrganizer
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All user routes require authentication and SUPERADMIN role
router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// POST /api/users - Create Event Organizer
router.post('/', createEventOrganizer);

// GET /api/users - List Event Organizers
router.get('/', listEventOrganizers);

// PUT /api/users/:id - Update Event Organizer
router.put('/:id', updateEventOrganizer);

// DELETE /api/users/:id - Delete Event Organizer
router.delete('/:id', deleteEventOrganizer);

export default router;
