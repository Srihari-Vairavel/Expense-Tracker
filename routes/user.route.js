const express = require('express');
const router = express.Router();
const route = require('../controllers/user.controller')

router.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres API' })
})

router.get('/singleUser/:id', route.singleUser)//getting single user by using id
router.get('/', route.getUsers) //getting Alluser data from the database
router.post('/newUser', route.createUser) //Creating a user to the database
router.put('/updateUser/:id', route.updateUser) //updating a user in the database
router.delete('/deleteUser/:id', route.deleteUser)//deleting a user in the database
router.delete('/deleteSelected',route.deleteSelected)//deleting the selected user

module.exports = router;