const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'test-mysql.anytrek.app',
  user: 'zhangbiqiong',
  password: 'Zbq20240614',
  database: 'zbqdemo'
};

async function getStatistics(year) {
  const connection = await mysql.createConnection(dbConfig);
  
  const [rows] = await connection.execute(
    `SELECT studentName, class, score FROM ranking WHERE year = ? ORDER BY score DESC`,
    [year]
  );
  
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
  
  await connection.end();
  return {
    year: year,
    statistics: result
  };
}

async function main() {
  const year = parseInt(process.argv[2]);
  
  if (!year || isNaN(year)) {
    console.error('请传入年份参数，例如: node ranking_statistics.js 2024');
    process.exit(1);
  }
  
  const result = await getStatistics(year);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
