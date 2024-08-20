'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Template extends Model {
        static associate(models) {
            Template.belongsTo(models.Voice, { foreignKey: 'aiVoice', as: 'voice' });
        }
    }
    Template.init({
        aiRole: DataTypes.STRING,
        prompt: DataTypes.TEXT,
        aiVoice: DataTypes.INTEGER,
        icon: DataTypes.STRING,
        slug: DataTypes.STRING,
        description: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Template',
    });
    return Template;
};