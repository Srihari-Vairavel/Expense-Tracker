const client = require('../config/database');


//To get all the users in the database
const getUsers = (req, res) => {

    client.query('select * from task where is_deleted = false', (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            res.status(200).json({ data: results.rows })
        }

    })

}

const singleUser = (req, res) => {
    const userId = req.params.id;

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ err: 'Please enter the valid ID' });
        return;
    }
    const query = 'select * from task where id = $1 and is_deleted = false';
    client.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'User not found' })
            } else {
                res.status(200).json(results.rows)
            }
        }
    })
}
const createUser = (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body

    //creating a new user to the table
    client.query('INSERT INTO task (firstname,lastname,email,mobilenumber) VALUES ($1, $2, $3, $4) RETURNING *', [firstname, lastname, email, mobilenumber], (err, results) => {
        if (err) {
            return res.status(500).json(err)
        } else {
            return res.status(201).json({ message: 'User created successfully' })
        }
    })
}

const updateUser = (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, mobilenumber } = req.body;


    if (isNaN(parseInt(id, 10))) {
        res.status(400).json({ err: 'Please enter the valid ID' })
    }

    const query = `UPDATE task SET firstname = $1, lastname = $2, email = $3, mobilenumber = $4 WHERE id = $5 and is_deleted = false RETURNING *`;
    //updating the user details
    client.query(
        query, [firstname, lastname, email, mobilenumber, id],
        (err, results) => {
            if (err) {
                res.status(500).json(err)
            } else {
                if (results.rowCount === 0) {
                   return res.status(404).json({ err: 'User not found' });
                } else {
                  return  res.status(200).json({message:'User updated successfully'});
                }
            }
        });
}

const deleteUser = (req, res) => {
    const { id } = req.params;
    const currentTime = new Date().toISOString();

    //Deleting the user details
    client.query('update task set is_deleted = true, deleted_at = $1 where id = $2 returning *', [currentTime, id], (err, results) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (results.rows.length === 0) {
                res.status(404).json({ err: 'User not found' })
            } else {
                res.status(200).json({ message: 'User deleted successfully' })
            }
        }
    })
}

const deleteSelected = (req, res) => {
    let selected = req.body.selected;
    if (!selected || !Array.isArray(selected) || selected.length === 0) {
       return res.status(400).json({err:'please select one id to delete'});
    }

    // Convert the array of strings to an array of integers
    selected = selected.map(id => parseInt(id, 10)); // Parse each element to an integer

    if (selected.some(isNaN)) {
        return res.status(400).json(err);
    }

    const currentTime = new Date().toISOString(); // Get the current timestamp

    const updateQuery = `
    UPDATE task
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

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    singleUser,
    deleteSelected,
}