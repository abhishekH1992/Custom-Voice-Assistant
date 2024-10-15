const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};
const mysql2 = require('mysql2');

let sequelize;
console.log(process.env.NODE_ENV);
if (config.use_env_variable && process.env.NODE_ENV === 'production') {
  const databaseUrl = new URL(process.env[config.use_env_variable]);
  sequelize = new Sequelize(databaseUrl.pathname.substr(1), databaseUrl.username, databaseUrl.password, {
    host: databaseUrl.hostname,
    port: databaseUrl.port,
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;