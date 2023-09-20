//const { response } = require('express');
const client = require('../config/database');

//to get All expense from budget Id
const getAllExpenseByBudgetId = (req, res) => {
    const searchQuery = req.query.search;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const limit = req.query.limit;

    const startIndex = (currentPage - 1) * limit;
    let query = 'SELECT * FROM expenses WHERE budget_id = $1 AND is_deleted = false';
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE budget_id = $1 AND is_deleted = false';
    let sumQuery = 'SELECT SUM(amount) FROM expenses WHERE budget_id = $1 AND is_deleted = false';

    if (searchQuery) {
        countQuery += ` AND name ILIKE '%${searchQuery}%'`;
        query += ` AND name ILIKE '%${searchQuery}%'`;
        sumQuery += ` AND name ILIKE '%${searchQuery}%'`;
    }

    if (sortBy) {
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    // Add the LIMIT and OFFSET clauses for pagination
    query += ` LIMIT ${limit} OFFSET ${startIndex}`;
   
    const { budget_id } = req.params;

    if (isNaN(parseInt(budget_id, 10))) {
        res.status(400).json({ err: 'Please enter valid IDs' });
        return;
    }

    client.query(query, [budget_id], (err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            client.query(countQuery, [budget_id], (err, countResult) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    client.query(sumQuery, [budget_id], (err, sumResult) => {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            const totalRows = countResult.rows[0].count;
                            console.log(sumResult)
                            const totalAmountSpent = sumResult.rows[0].sum? sumResult.rows[0].sum:0;
                            const totalPages = Math.ceil(totalRows / limit);
                            const totalBudget = res.amount;
                            const remainingBalance = totalBudget - totalAmountSpent
                            res.status(200).json({ data: results.rows, totalRows, totalAmountSpent,totalBudget,remainingBalance , totalPages});
                        }
                    });
                }
            });
        }
    });
};



//to get single expense from budget Id
const getExpenseByBudgetId = (req, res) => {
    const { budget_id, expense_id } = req.params

    if (isNaN(parseInt(budget_id, 10)) || isNaN(parseInt(expense_id, 10))) {
        res.status(400).json({ err: 'Please enter the valid IDs' });
        return;
    }
    const query = 'select * FROM expenses where budget_id = $1 and expense_id = $2 and is_deleted = false';
    client.query(query, [budget_id, expense_id], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'Expense not found' })
            } else {
                res.status(200).json(results.rows)
            }
        }
    })
}


//To create new expense in the database
const createExpense = (req, res) => {
    const { name, amount, budget_id } = req.body

    //creating a new Expense to the table
    client.query('INSERT INTO expenses (name,amount,budget_id) VALUES ($1, $2, $3) RETURNING *', [name, amount, budget_id], (err, results) => {
        if (err) {
            return res.status(500).json(err)
        } else {
            return res.status(201).json({ message: 'Expense created successfully' })
        }
    })
}

//To update the expense in database
const updateExpense = (req, res) => {
    const { expense_id } = req.params;
    const currentTime = new Date().toISOString();
    const { name, amount } = req.body;


    if (isNaN(parseInt(expense_id, 10))) {
        res.status(400).json({ err: 'Please enter the valid ID' })
    }

    const query = `UPDATE expenses SET name = $1, amount = $2, last_updated = $3 WHERE expense_id = $4 and is_deleted = false RETURNING *`;
    client.query(
        query, [name, amount, currentTime, expense_id],
        (err, results) => {
            if (err) {
                res.status(500).json(err)
            } else {
                if (results.rowCount === 0) {
                    return res.status(404).json({ err: 'expense not found' });
                } else {
                    return res.status(200).json({ message: 'expense updated successfully' });
                }
            }
        });
}

const deleteExpense = (req, res) => {
    const { expense_id } = req.params;
    const currentTime = new Date().toISOString();

    //Deleting the expenses details
    client.query('update expenses set is_deleted = true, deleted_at = $1 where expense_id = $2 returning *', [currentTime, expense_id], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'expense not found' })
            } else {
                res.status(200).json({ message: 'expense deleted successfully' })
            }
        }
    })
}

const deleteSelectedExpense = (req, res) => {
    let selected = req.body.selected;
    if (!selected || !Array.isArray(selected) || selected.length === 0) {
        return res.status(400).json({ err: 'please select one id to delete' });
    }

    // Convert the array of strings to an array of integers
    selected = selected.map(id => parseInt(id, 10)); // Parse each element to an integer

    if (selected.some(isNaN)) {
        return res.status(400).json(err);
    }

    const currentTime = new Date().toISOString(); // Get the current timestamp

    const updateQuery = `
    UPDATE expenses
    SET is_deleted = true, deleted_at = $1
    WHERE expense_id = ANY($2::int[])`;

    client.query(updateQuery, [currentTime, selected], (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            return res.json({ message: `${result.rowCount} row deleted successfully` });
        }
    });
}

module.exports = {
    getAllExpenseByBudgetId,
    getExpenseByBudgetId,
    createExpense,
    updateExpense,
    deleteExpense,
    deleteSelectedExpense
}

