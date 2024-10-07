require('dotenv').config();


module.exports = {
    "development": {
        "username": "root",
        "password": "",
        "database": "akoplus",
        "host": "localhost",
        "dialect": "mysql",
        "port": 3306
    },
    "test": {
        "username": "root",
        "password": "root",
        "database": "akoplus",
        "host": "localhost",
        "dialect": "mysql"
    },
    "production": {
        "use_env_variable": 'DATABASE_URL',
        "dialect": "mysql",
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        },
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        }
    }
}