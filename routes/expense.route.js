const express = require('express');
const router = express.Router();
const route = require('../controllers/expense.controller');

router.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres API' })
});

//get all expense by budget id
router.get('/Budgets/:budget_id/Expenses', route.getAllExpenseByBudgetId);

//Get single expense by budgetid
router.get('/Budgets/:budget_id/Expenses/:expense_id',route.getExpenseByBudgetId)

//create new expenses
router.post('/Expenses',route.createExpense)

// Update a expense by ID
router.put('/Expenses/:expense_id', route.updateExpense);

// Delete a expense by ID
router.delete('/Expenses/:expense_id', route.deleteExpense);

//delete a selected expense
router.delete('/Expenses',route.deleteSelectedExpense)

module.exports = router;