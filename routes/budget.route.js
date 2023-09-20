const express = require('express');
const router = express.Router();
const route = require('../controllers/budget.controller')

router.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres API' })
});

// Get all budgets
router.get('/Budgets', route.getAllBudgets);

// Get a budget by ID
router.get('/Budgets/:budget_id', route.getBudgetById);

// Create a new budget
router.post('/Budgets', route.createBudget);

// Update a budget by ID
router.put('/Budgets/:budget_id', route.updateBudget);

// Delete a budget by ID
router.delete('/Budgets/:budget_id', route.deleteBudget);

//delete a selected budget
router.delete('/Budgets',route.deleteSelected);

router.put('/Budgets/:budget_id', route.budgetStatus)

module.exports = router;