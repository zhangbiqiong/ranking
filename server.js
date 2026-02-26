const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('./config/logger');
const { sequelize, testConnection } = require('./models/database');
const { Ranking, syncModel } = require('./models/Ranking');

const isProduction = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const configFile = isProduction ? 'config.prod.json' : 'config.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const dbConfig = config.db;
const PORT = config.server.port;

const app = express();
app.use(express.static('public'));

async function getStatistics(year) {
  // 使用Sequelize查询数据
  const rows = await Ranking.findAll({
    where: { year },
    attributes: ['studentName', 'class', 'score'],
    order: [['score', 'DESC']]
  });
  
  const result = [];
  const totalRankingMap = new Map();
  let totalRank = 1;
  for (const row of rows) {
    totalRankingMap.set(row.studentName, totalRank++);
  }
  
  const classGroups = {};
  for (const row of rows) {
    if (!classGroups[row.class]) classGroups[row.class] = [];
    classGroups[row.class].push(row);
  }
  
  const classRankingMap = {};
  for (const className in classGroups) {
    let rank = 1;
    for (const row of classGroups[className]) {
      if (!classRankingMap[row.studentName]) classRankingMap[row.studentName] = {};
      classRankingMap[row.studentName][className] = rank++;
    }
  }
  
  const seenStudents = new Set();
  for (const row of rows) {
    if (!seenStudents.has(row.studentName)) {
      seenStudents.add(row.studentName);
      result.push({
        studentName: row.studentName,
        className: row.class,
        score: row.score,
        class_ranking: classRankingMap[row.studentName][row.class],
        total_ranking: totalRankingMap.get(row.studentName)
      });
    }
  }
  
  return {
    year: year,
    statistics: result
  };
}

/**
 * @swagger
 * /api/statistics/{year}:
 *   get:
 *     tags: [statistics]
 *     summary: 获取指定年份的成绩排名统计
 *     description: 根据年份查询学生成绩排名，包括总分排名和班级内排名，按分数降序排列
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         description: 年份
 *         schema:
 *           type: integer
 *           example: 2024
 *           minimum: 2000
 *           maximum: 2100
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                   description: 年份
 *                 statistics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentName:
 *                         type: string
 *                         description: 学生姓名
 *                       className:
 *                         type: string
 *                         description: 班级名称
 *                       score:
 *                         type: integer
 *                         description: 分数
 *                         minimum: 0
 *                         maximum: 100
 *                       class_ranking:
 *                         type: integer
 *                         description: 班级内排名
 *                         minimum: 1
 *                       total_ranking:
 *                         type: integer
 *                         description: 总排名
 *                         minimum: 1
 *             example:
 *               year: 2024
 *               statistics:
 *                 - studentName: "张伟"
 *                   className: "classA"
 *                   score: 98
 *                   class_ranking: 1
 *                   total_ranking: 1
 *                 - studentName: "李娜"
 *                   className: "classA"
 *                   score: 95
 *                   class_ranking: 2
 *                   total_ranking: 2
 *       400:
 *         description: 无效的年份参数
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "请传入有效年份"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "数据库连接失败"
 */
app.get('/api/statistics/:year', async (req, res) => {
  const year = req.params.year;
  logger.info(`收到统计查询请求，年份: ${year}`);
  
  try {
    const parsedYear = parseInt(year);
    if (!parsedYear || isNaN(parsedYear)) {
      logger.warn(`无效的年份参数: ${year}`);
      return res.status(400).json({ error: '请传入有效年份' });
    }
    
    const result = await getStatistics(parsedYear);
    logger.info(`统计查询成功，年份: ${parsedYear}, 数据条数: ${result.statistics.length}`);
    res.json(result);
  } catch (error) {
    logger.error(`统计查询失败，年份: ${year}`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/years:
 *   get:
 *     tags: [years]
 *     summary: 获取所有可用的年份
 *     description: 返回系统中所有存在数据的年份列表，按年份降序排列
 *     responses:
 *       200:
 *         description: 成功获取年份列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *                 description: 年份
 *                 minimum: 2000
 *                 maximum: 2100
 *             example:
 *               - 2026
 *               - 2025
 *               - 2024
 *               - 2023
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "数据库连接失败"
 */
app.get('/api/years', async (req, res) => {
  logger.info('收到年份列表查询请求');
  
  try {
    // 使用Sequelize查询数据
    const rows = await Ranking.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('year')), 'year']],
      order: [['year', 'DESC']]
    });
    
    const years = rows.map(r => r.year);
    logger.info(`年份列表查询成功，年份数量: ${years.length}`);
    res.json(years);
  } catch (error) {
    logger.error('年份列表查询失败', error);
    res.status(500).json({ error: error.message });
  }
});

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '学生成绩排名统计系统 API',
      version: '1.0.0',
      description: '提供学生成绩排名统计的RESTful API接口，支持按年份查询成绩排名和获取可用年份列表',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC License',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: '本地开发服务器'
      }
    ],
    tags: [
      {
        name: 'statistics',
        description: '成绩统计相关接口'
      },
      {
        name: 'years',
        description: '年份相关接口'
      }
    ]
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 启动服务器前初始化数据库
async function initDatabase() {
  try {
    logger.info('开始初始化数据库');
    await testConnection();
    await syncModel();
    logger.info('数据库初始化完成');
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 启动服务器
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    logger.info(`服务已启动: http://localhost:${PORT}`);
    logger.info(`API文档地址: http://localhost:${PORT}/api-docs`);
  });
}

// 执行启动
startServer();
