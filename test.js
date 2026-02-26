const http = require('http');
const { Sequelize, DataTypes } = require('sequelize');

const dbConfig = {
  host: 'test-mysql.anytrek.app',
  user: 'zhangbiqiong',
  password: 'Zbq20240614',
  database: 'zbqdemo'
};

// 创建Sequelize实例
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  logging: false
});

// 定义Ranking模型
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

const chineseNames = [
  '张伟', '李娜', '王芳', '刘洋', '陈静', '杨明', '赵磊', '孙丽', '周强', '吴敏',
  '郑鹏', '王秀英', '李明', '陈涛', '林芳', '黄勇', '周莉', '吴磊', '徐婷', '何伟',
  '高鹏', '罗娜', '宋杰', '韩雪', '唐静', '冯华', '于磊', '董芳', '袁娜', '卢刚',
  '蒋涛', '蔡丽', '丁明', '余静', '叶磊', '苏娜', '魏强', '卢芳', '史丽', '龙刚',
  '汤杰', '常静', '温娜', '莫磊', '秦芳', '顾丽', '雷强', '贺涛', '钱娜', '施静',
  '张磊', '牛芳', '洪娜', '崔刚', '夏杰', '钟静', '舒婷', '蓝磊', '厉芳', '路丽',
  '欧强', '阳涛', '暴娜', '封静', '窦磊', '祁芳', '缪娜', '干练', '武杰', '柴静'
];

const classes = ['classA', 'classB', 'classC', 'classD', 'classE', 'classF', 'classG'];
const years = [2023, 2024, 2025, 2026];

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

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function verifyFormat(result, year) {
  let passed = 0;
  let failed = 0;
  
  if (!result || typeof result !== 'object') {
    console.log('FAIL: 结果应该是对象');
    return { passed: 0, failed: 1 };
  }
  
  if (result.year !== year) {
    console.log(`FAIL: year应为${year}，实际为${result.year}`);
    failed++;
  } else {
    passed++;
  }
  
  if (!Array.isArray(result.statistics)) {
    console.log('FAIL: statistics应为数组');
    failed++;
    return { passed, failed };
  }
  
  passed++;
  
  return { passed, failed };
}

function verifyFieldComplete(stat, index) {
  let passed = 0;
  let failed = 0;
  const requiredFields = ['studentName', 'className', 'class_ranking', 'total_ranking'];
  
  for (const field of requiredFields) {
    if (stat[field] === undefined || stat[field] === null) {
      console.log(`FAIL: 第${index + 1}条记录缺少${field}字段`);
      failed++;
    } else {
      passed++;
    }
  }
  
  return { passed, failed };
}

function verifyRankingRange(stat, index) {
  let passed = 0;
  let failed = 0;
  
  if (stat.total_ranking < 1 || stat.total_ranking > 70) {
    console.log(`FAIL: ${stat.studentName} total_ranking范围错误: ${stat.total_ranking}`);
    failed++;
  } else {
    passed++;
  }
  
  if (stat.class_ranking < 1 || stat.class_ranking > 10) {
    console.log(`FAIL: ${stat.studentName} class_ranking范围错误: ${stat.class_ranking}`);
    failed++;
  } else {
    passed++;
  }
  
  return { passed, failed };
}

function verifyClassName(stat, index) {
  let passed = 0;
  let failed = 0;
  
  if (!classes.includes(stat.className)) {
    console.log(`FAIL: ${stat.studentName} className值无效: ${stat.className}`);
    failed++;
  } else {
    passed++;
  }
  
  return { passed, failed };
}

function verifyStudentCount(result) {
  if (result.statistics.length !== 70) {
    console.log(`FAIL: 统计数据条数应为70，实际为${result.statistics.length}`);
    return { passed: 0, failed: 1 };
  }
  return { passed: 1, failed: 0 };
}

async function verifyResults(result, year) {
  console.log(`\n=== 验证 ${year} 年统计结果 ===`);
  let totalPassed = 0;
  let totalFailed = 0;
  
  const fmt = verifyFormat(result, year);
  totalPassed += fmt.passed;
  totalFailed += fmt.failed;
  
  if (totalFailed > 0) {
    console.log(`格式验证失败，跳过详细验证`);
    console.log(`验证结果: 通过 ${totalPassed} 项, 失败 ${totalFailed} 项`);
    return false;
  }
  
  const count = verifyStudentCount(result);
  totalPassed += count.passed;
  totalFailed += count.failed;
  
  for (let i = 0; i < result.statistics.length; i++) {
    const stat = result.statistics[i];
    
    const field = verifyFieldComplete(stat, i);
    totalPassed += field.passed;
    totalFailed += field.failed;
    
    const range = verifyRankingRange(stat, i);
    totalPassed += range.passed;
    totalFailed += range.failed;
    
    const className = verifyClassName(stat, i);
    totalPassed += className.passed;
    totalFailed += className.failed;
  }
  
  console.log(`验证结果: 通过 ${totalPassed} 项, 失败 ${totalFailed} 项`);
  return totalFailed === 0;
}

async function verifyAPI(year) {
  console.log(`\n=== 验证 API /api/statistics/${year} ===`);
  try {
    const data = await httpGet(`http://localhost:3000/api/statistics/${year}`);
    return await verifyResults(data, year);
  } catch (error) {
    console.log(`FAIL: API请求失败 - ${error.message}`);
    return false;
  }
}

async function verifyYearsAPI() {
  console.log(`\n=== 验证 API /api/years ===`);
  try {
    const data = await httpGet('http://localhost:3000/api/years');
    if (!Array.isArray(data)) {
      console.log('FAIL: /api/years 应返回数组');
      return false;
    }
    if (data.length !== 4) {
      console.log(`FAIL: 应有4个年份，实际有${data.length}个`);
      return false;
    }
    console.log(`验证结果: 通过 1 项, 失败 0 项`);
    return true;
  } catch (error) {
    console.log(`FAIL: API请求失败 - ${error.message}`);
    return false;
  }
}

async function main() {
  // 测试数据库连接
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
  
  // 重新创建表
  await Ranking.sync({ force: true });
  console.log('表创建成功');
  
  // 准备数据
  const values = [];
  for (const year of years) {
    for (let i = 0; i < classes.length; i++) {
      for (let j = 0; j < 10; j++) {
        const nameIndex = i * 10 + j;
        values.push({
          studentName: chineseNames[nameIndex],
          score: Math.floor(Math.random() * 101),
          class: classes[i],
          year: year
        });
      }
    }
  }
  
  // 批量插入数据
  await Ranking.bulkCreate(values);
  console.log(`成功插入${values.length}条数据`);
  
  let allPassed = true;
  
  console.log('\n========== 数据库直接查询验证 ==========');
  for (const year of years) {
    const result = await getStatistics(year);
    const passed = await verifyResults(result, year);
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    console.log('\n所有测试通过!');
  } else {
    console.log('\n部分测试失败!');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
