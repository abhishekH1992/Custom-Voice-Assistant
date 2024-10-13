require('dotenv').config();

module.exports = {
  development: {
    username: "root",
    password: "",
    database: "akoplus",
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    // dialectOptions: {
    //   socketPath : "/Applications/MAMP/tmp/mysql/mysql.sock"
    // },
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
    dialectModule: require('mysql2'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};