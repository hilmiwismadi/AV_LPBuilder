const express = require('express');
const router = express.Router();
const mockTransactions = require('../data/mockTransactions');
const mockSubmissions = require('../data/mockSubmissions');
const mockRegistrations = require('../data/mockRegistrations');

// Get transactions
router.get('/transactions', (req, res) => {
  res.json(mockTransactions.transactions);
});

// Get financial insights
router.get('/financials', (req, res) => {
  const totalRevenue = mockTransactions.transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const platformFee = totalRevenue * 0.05;
  const netAmount = totalRevenue - platformFee;
  
  res.json({
    totalRevenue,
    platformFee,
    netAmount,
    withdrawable: netAmount,
    transactionCount: mockTransactions.transactions.length
  });
});

// Get submissions
router.get('/submissions', (req, res) => {
  res.json(mockSubmissions.submissions);
});

// Update submission score
router.put('/submissions/:id', (req, res) => {
  const { score, status } = req.body;
  const submission = mockSubmissions.submissions.find(s => s.id === req.params.id);
  if (submission) {
    submission.score = score;
    submission.status = status;
    res.json(submission);
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Get registrants
router.get('/registrants', (req, res) => {
  res.json(mockRegistrations.registrations);
});

module.exports = router;
