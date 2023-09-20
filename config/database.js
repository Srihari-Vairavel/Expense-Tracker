const Client = require('pg').Client
const client = new Client({
  host: process.env.db_host,
  user: process.env.db_user,
  port: process.env.db_port,
  password: process.env.db_password,
  database: process.env.db_database,
})
client.connect((err) => {
  if (err) {
    console.log("database err");
  } else {
    console.log("database connected");
  }
});

module.exports = client;

