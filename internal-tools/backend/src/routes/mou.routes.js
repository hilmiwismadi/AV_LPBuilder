import { Router } from 'express';
import {
  listMous,
  createMou,
  getMou,
  updateMou,
  deleteMou
} from '../controllers/mou.controller.js';

const router = Router();

router.get('/', listMous);
router.post('/', createMou);
router.get('/:id', getMou);
router.put('/:id', updateMou);
router.delete('/:id', deleteMou);

export default router;
