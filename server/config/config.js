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
        "use_env_variable": "mysql://akoplusco_convo:vOm)RMjzT,Uj@node56.myfcloudau.com:3306/akoplusco_convo",
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