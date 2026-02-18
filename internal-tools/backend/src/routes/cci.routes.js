import { Router } from 'express';
import {
  listClients,
  createClient,
  getClient,
  updateClient,
  deleteClient,
  addNote,
  updateNote,
  deleteNote,
  getFlaggedTech
} from '../controllers/cci.controller.js';

const router = Router();

router.get('/flagged-tech', getFlaggedTech);
router.get('/', listClients);
router.post('/', createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/:id/notes', addNote);
router.patch('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

export default router;
