'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Type extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        }
    }
    Type.init({
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        isAudio: DataTypes.BOOLEAN,
        duration: DataTypes.INTEGER,
        isText: DataTypes.BOOLEAN,
        isActive: DataTypes.BOOLEAN,
        icon: DataTypes.STRING,
        isAutomatic: DataTypes.BOOLEAN,
        isContinous: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Type',
    });
    return Type;
};