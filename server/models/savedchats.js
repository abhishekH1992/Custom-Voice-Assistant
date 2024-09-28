'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedChats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SavedChats.init({
    userId: DataTypes.INTEGER,
    templateId: DataTypes.INTEGER,
    chats: DataTypes.JSONB,
    name: DataTypes.STRING,
    feedback: DataTypes.JSONB,
    table: DataTypes.JSONB,
    feedbackLastGeneratedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'SavedChats',
  });
  return SavedChats;
};