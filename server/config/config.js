const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock'
        },
    },
    test: {
        username: process.env.TEST_DB_USER || 'root',
        password: process.env.TEST_DB_PASS || 'root',
        database: process.env.TEST_DB_NAME || 'akoplus_test',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: process.env.TEST_DB_PORT || 3306,
        dialect: 'mysql',
    },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
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