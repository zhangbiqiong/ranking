const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');
const logger = require('../config/logger');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: '用户名已存在'
    },
    validate: {
      notEmpty: {
        msg: '用户名不能为空'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '密码不能为空'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: false
});

async function syncModel() {
  try {
    logger.info('开始同步User模型到数据库');
    await User.sync({ alter: true });
    logger.info('User模型同步成功');
  } catch (error) {
    logger.error('User模型同步失败:', error);
    throw error;
  }
}

module.exports = {
  User,
  syncModel
};
