import express from 'express';
import {
  getAllConfigurations,
  getConfigurationById,
  getConfigurationBySlug,
  getPublicConfiguration,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration
} from '../controllers/config.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { checkConfigOwnership } from '../middleware/authorize.js';

const router = express.Router();

// Public route - no authentication required (for subdomain viewing)
router.get('/public/:slug', getPublicConfiguration);

// All other routes require authentication
router.use(authenticate);
router.use(authorize('SUPERADMIN', 'EVENT_ORGANIZER'));

// GET all configurations (filtered by ownership)
router.get('/', getAllConfigurations);

// POST create new configuration
router.post('/', createConfiguration);

// GET single configuration by ID (with ownership check)
router.get('/:id', checkConfigOwnership, getConfigurationById);

// GET configuration by slug (for preview page)
router.get('/by-slug/:slug', checkConfigOwnership, getConfigurationBySlug);

// PUT update configuration (with ownership check)
router.put('/:id', checkConfigOwnership, updateConfiguration);

// DELETE configuration (with ownership check)
router.delete('/:id', checkConfigOwnership, deleteConfiguration);

export default router;
