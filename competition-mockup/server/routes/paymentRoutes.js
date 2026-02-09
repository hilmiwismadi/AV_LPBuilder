const express = require('express');
const router = express.Router();

// Simulate payment processing
router.post('/process', (req, res) => {
  const { registrationId, amount, method } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      transactionId: 'txn-' + Date.now(),
      status: 'Completed',
      message: 'Payment processed successfully'
    });
  }, 2000);
});

module.exports = router;
