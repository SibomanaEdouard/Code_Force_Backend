const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

router.post('/', auth, budgetController.setBudget);
router.get('/alerts', auth, budgetController.getBudgetAlerts);

module.exports = router;