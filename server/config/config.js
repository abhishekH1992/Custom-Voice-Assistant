require('dotenv').config();
const fs = require('fs');
const path = require('path');

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
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "dialectModule": require('mysql2'),
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
    },
    "ssh": {
      "host": process.env.SSH_HOST,
      "port": 22,
      "username": process.env.SSH_USERNAME,
      "privateKey": process.env.SSH_PRIVATE_KEY
        ? fs.readFileSync(path.resolve(__dirname, process.env.SSH_PRIVATE_KEY))
        : undefined,
      "dstHost": process.env.DB_HOST,
      "dstPort": process.env.DB_PORT,
      "localHost": "127.0.0.1",
      "localPort": 3306
    }
  }
}