const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const isProduction = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const configFile = isProduction ? 'config.prod.json' : 'config.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const dbConfig = config.db;
const PORT = config.server.port;

const app = express();
app.use(express.static('public'));

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
        score: row.score,
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

app.get('/api/statistics/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: '请传入有效年份' });
    }
    const result = await getStatistics(year);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/years', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`SELECT DISTINCT year FROM ranking ORDER BY year DESC`);
    await connection.end();
    res.json(rows.map(r => r.year));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务已启动: http://localhost:${PORT}`);
});
