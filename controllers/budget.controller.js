const client = require('../config/database');

//To get all the budget in the database
const getAllBudgets = (req, res) => {
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder
    const searchQuery = req.query.query;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const limit = req.query.limit

    const startIndex = (currentPage - 1) * limit;
    let query = "SELECT id,name,amount,TO_CHAR(on_date,'yyyy-MM-dd') as on_date,status FROM budgets WHERE is_deleted = false";
    let countQuery = 'SELECT count(*) FROM budgets WHERE is_deleted = false'


    if (searchQuery) {
        countQuery += ` AND name ILIKE '%${searchQuery}%'`;
        query += ` AND name ILIKE '%${searchQuery}%'`;
    }
    // Check if sortBy is provided and valid, and add the ORDER BY clause
    if (sortBy) {
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    // Add the LIMIT and OFFSET clauses for pagination
    query += ` LIMIT ${limit} OFFSET ${startIndex}`;

    client.query(query,(err, results) => {
        if (err) {
            res.status(500).json(err);
        } else {
            client.query(countQuery, (err, countResult) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    const totalRows = countResult.rows[0].count;
                    res.status(200).json({ data: results.rows, totalRows: totalRows });
                }
            });
        }
    });
};


const getBudgetById = (req, res) => {
    const { budget_id } = req.params

    if (isNaN(parseInt(budget_id, 10))) {
        res.status(400).json({ err: 'Please enter the valid ID' });
        return;
    }
    const query = "select name,amount,TO_CHAR(on_date,'yyyy-MM-dd') as on_date, status FROM budgets where id = $1 and is_deleted = false";
    client.query(query, [budget_id], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'Budget not found' })
            } else {
                res.status(200).json(results.rows[0])
            }
        }
    })
}


const createBudget = (req, res) => {
    const { name, amount, on_date } = req.body

    //creating a new Budget to the table
    client.query('INSERT INTO budgets (name,amount,on_date) VALUES ($1, $2, $3) RETURNING *', [name, amount, on_date], (err, results) => {
        if (err) {
            return res.status(500).json(err)
        } else {
            return res.status(201).json({ message: 'Budget created successfully' })
        }
    })
}

const updateBudget = (req, res) => {
    const { budget_id } = req.params;
    const currentTime = new Date().toISOString();
    const { name, amount, on_date } = req.body;


    if (isNaN(parseInt(budget_id, 10))) {
        res.status(400).json({ err: 'Please enter the valid ID' })
    }

    const query = `UPDATE budgets SET name = $1, amount = $2, on_date = $3, last_updated = $4 WHERE id = $5 and is_deleted = false  RETURNING *`;
    //updating the Budget details
    client.query(
        query, [name, amount, on_date, currentTime, budget_id],
        (err, results) => {
            if (err) {
                res.status(500).json(err)
            } else {
                if (results.rowCount === 0) {
                    return res.status(404).json({ err: 'budget not found' });
                } else {
                    return res.status(200).json({ message: 'budget updated successfully' });
                }
            }
        });
}

const deleteBudget = (req, res) => {
    const { budget_id } = req.params;
    const currentTime = new Date().toISOString();

    //Deleting the budget details
    client.query('update budgets set is_deleted = true, deleted_at = $1 where id = $2 returning *', [currentTime,  budget_id], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'budget not found' })
            } else {
                res.status(200).json({ message: 'budget deleted successfully' })
            }
        }
    })
}

const deleteSelected = (req, res) => {
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
    UPDATE budgets
    SET is_deleted = true, deleted_at = $1
    WHERE id = ANY($2::int[])`;

    client.query(updateQuery, [currentTime, selected], (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            return res.json({ message: `${result.rowCount} row deleted successfully` });
        }
    });
}

const budgetStatus = (req , res) =>{
    const budget_id = req.params.budget_id;
    const updateStatus = req.body.status
    console.log(budget_id, updateStatus);

    const query = ` select status from budgets where id = $1`

    client.query(query,[budget_id], (err, result) =>{
        if(err){
            return res.status(500).json({ error: 'Internal Server Error' });
        }else{
            const updateQuery = `update budgets set status = '${updateStatus}' where id = $1`
            client.query(updateQuery, [budget_id],(err,result) =>{
                // console.log(result);
                if(err){
                    return res.status(500).json({ error: 'Internal Server Error' });
                }else{
                    res.send({ status:'success', message:`budget is ${updateStatus}`, result})
                }
            })
        }
    })
}

module.exports = {
    getAllBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    deleteSelected,
    budgetStatus
};