# 学生成绩排名统计系统

## 项目介绍

这是一个基于 Node.js + Express + Vue 3 的学生成绩排名统计系统，提供 Web 页面展示和 REST API 接口。

## 项目结构

```
├── server.js           # Express 后端服务
├── public/
│   └── index.html     # Vue 3 前端页面
├── config.json        # 开发环境配置
├── config.prod.json   # 生产环境配置
├── start.sh          # 启动脚本
├── test.js           # 测试脚本
├── README.md         # 项目文档
├── package.json
└── node_modules/
```

## 配置说明

### 开发环境配置 (config.json)

```json
{
  "db": {
    "host": "your-mysql-host",
    "user": "your-username",
    "password": "your-password",
    "database": "your-database"
  },
  "server": {
    "port": 3000
  }
}
```

### 生产环境配置 (config.prod.json)

生产环境已内置在打包文件中，包含数据库连接信息。

### 配置项说明

| 配置项 | 说明 |
|--------|------|
| db.host | MySQL 数据库地址 |
| db.user | 数据库用户名 |
| db.password | 数据库密码 |
| db.database | 数据库名称 |
| server.port | 服务端口，默认 3000 |

---

## 快速开始

### 开发环境

```bash
# 1. 安装依赖
npm install

# 2. 修改配置
vim config.json

# 3. 启动服务
npm start
```

### 生产环境

```bash
# 1. 解压
tar -xzvf ranking-system.tar.gz

# 2. 启动（使用 pm2 管理）
pm2 start server.js --name ranking -- --prod
```

---

## 打包说明

### 打包命令

```bash
tar -czvf ranking-system.tar.gz \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  server.js config.prod.json public/ start.sh test.js \
  package.json package-lock.json node_modules/
```

### 打包产物

- `ranking-system.tar.gz` - 包含所有依赖的压缩包（约 3.4MB）

### 使用打包产物

解压后使用 pm2 启动：

```bash
tar -xzvf ranking-system.tar.gz
pm2 start server.js --name ranking -- --prod
```

---

## PM2 管理命令

```bash
# 启动
pm2 start server.js --name ranking -- --prod

# 查看状态
pm2 status

# 查看日志
pm2 logs ranking

# 重启
pm2 restart ranking

# 停止
pm2 stop ranking

# 删除
pm2 delete ranking
```

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm start` | 启动开发服务 |
| `npm run start:prod` | 使用生产配置启动 |
| `npm test` | 运行测试 |

---

## 功能特性

### Web 界面
- 左右布局：左侧年份导航，右侧统计内容
- 默认显示：打开页面自动加载最近年份数据
- 年份选择：点击左侧年份切换，按年份降序排列
- 学生搜索：支持按姓名模糊匹配
- 班级筛选：全部、classA-classG
- 成绩展示：显示学生成绩，按分数颜色区分（≥90绿色/60-89蓝色/<60红色）
- 统计摘要：总人数、班级数、平均分、最高分
- 总排名前三名高亮显示
- 基于 Bootstrap 5 响应式布局

### REST API

#### 获取年份列表
```
GET /api/years
```

#### 获取指定年份统计
```
GET /api/statistics/:year
```

---

## 数据说明

- **表**: ranking
- **字段**: id, studentName, score, class, year
- **班级**: classA - classG（7个班级）
- **每班人数**: 10人
- **年份**: 2023-2026
- **每年数据**: 70条

## 返回格式

```json
{
  "year": 2024,
  "statistics": [
    {
      "studentName": "张伟",
      "className": "classA",
      "score": 85,
      "class_ranking": 1,
      "total_ranking": 1
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| year | number | 年份 |
| statistics | array | 统计结果数组 |
| studentName | string | 学生姓名 |
| className | string | 所属班级 |
| score | number | 成绩（0-100） |
| class_ranking | number | 班级排名（1-10） |
| total_ranking | number | 总排名（1-70） |

---

## API 接口示例

```bash
# 获取年份列表
curl http://localhost:3000/api/years

# 获取2024年统计
curl http://localhost:3000/api/statistics/2024
```
