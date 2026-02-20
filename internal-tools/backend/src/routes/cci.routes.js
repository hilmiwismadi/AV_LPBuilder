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
  getFlaggedTech,
  searchNotes,
  addLink,
  updateLink,
  deleteLink,
} from '../controllers/cci.controller.js';

const router = Router();

router.get('/flagged-tech', getFlaggedTech);
router.get('/notes/search', searchNotes);
router.get('/', listClients);
router.post('/', createClient);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/:id/notes', addNote);
router.patch('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);
router.post('/:id/links', addLink);
router.patch('/:id/links/:linkId', updateLink);
router.delete('/:id/links/:linkId', deleteLink);

export default router;
