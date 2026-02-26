const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');
const logger = require('../config/logger');

const Ranking = sequelize.define('Ranking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ranking',
  timestamps: false
});

// 同步模型到数据库
async function syncModel() {
  try {
    logger.info('开始同步Ranking模型到数据库');
    await Ranking.sync({ alter: true });
    logger.info('Ranking模型同步成功');
  } catch (error) {
    logger.error('Ranking模型同步失败:', error);
    throw error;
  }
}

module.exports = {
  Ranking,
  syncModel
};
