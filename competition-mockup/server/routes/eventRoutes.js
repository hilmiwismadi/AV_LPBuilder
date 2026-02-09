const express = require('express');
const router = express.Router();
const mockEvents = require('../data/mockEvents');

// Get public event by slug
router.get('/public/:slug', (req, res) => {
  const event = mockEvents.events.find(e => e.slug === req.params.slug);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Get all events (for testing)
router.get('/', (req, res) => {
  res.json(mockEvents.events);
});

module.exports = router;
