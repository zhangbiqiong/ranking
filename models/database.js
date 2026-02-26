const { Sequelize } = require('sequelize');
const fs = require('fs');
const logger = require('../config/logger');

const isProduction = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const configFile = isProduction ? 'config.prod.json' : 'config.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const dbConfig = config.db;

// 创建Sequelize实例
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
async function testConnection() {
  try {
    logger.info('开始测试数据库连接');
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection
};
