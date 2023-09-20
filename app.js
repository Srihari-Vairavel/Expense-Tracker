require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./routes/user.route')
const budgetRoutes = require('./routes/budget.route')
const expenseRoutes = require('./routes/expense.route')

app.use(cors());
app.use(bodyParser.json())
app.use('/users',userRoutes);
app.use('/',budgetRoutes);
app.use('/',expenseRoutes);


app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

module.exports = app