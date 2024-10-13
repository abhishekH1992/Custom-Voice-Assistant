require('dotenv').config();

module.exports = {
  development: {
    username: "root",
    password: "root",
    database: "akoplus",
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    dialectOptions: {
      socketPath : "/Applications/MAMP/tmp/mysql/mysql.sock"
    },
  },
  test: {
    username: "root",
    password: "root",
    database: "akoplus",
    host: "localhost",
    dialect: "mysql"
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  },
};