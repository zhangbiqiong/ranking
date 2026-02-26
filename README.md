# 学生成绩排名统计系统

## 项目介绍

这是一个基于 Node.js + Express + Vue 3 的学生成绩排名统计系统，提供 Web 页面展示和 REST API 接口。支持用户注册登录，按年份查看成绩排名。

## 项目结构

```
├── server.js              # Express 后端服务
├── config.json           # 开发环境配置
├── config.prod.json      # 生产环境配置
├── models/
│   ├── database.js       # 数据库连接
│   ├── ranking.js        # Ranking 模型
│   └── user.js          # User 模型
├── public/
│   ├── index.html       # Vue 3 前端页面
│   ├── css/
│   │   └── style.css   # 样式文件
│   └── js/
│       └── app.js      # 前端逻辑
├── test.js              # 测试脚本
├── README.md            # 项目文档
├── AGENTS.md           # Agent 开发指南
├── opencode.jsonc      # OpenCode 配置
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
  },
  "jwt": {
    "secret": "your-jwt-secret",
    "expiresIn": "24h"
  }
}
```

### 配置项说明

| 配置项 | 说明 |
|--------|------|
| db.host | MySQL 数据库地址 |
| db.user | 数据库用户名 |
| db.password | 数据库密码 |
| db.database | 数据库名称 |
| server.port | 服务端口，默认 3000 |
| jwt.secret | JWT 密钥 |
| jwt.expiresIn | JWT 有效期，默认 24h |

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
  server.js config.prod.json public/ test.js \
  package.json package-lock.json node_modules/
```

### 打包产物

- `ranking-system.tar.gz` - 包含所有依赖的压缩包

### 使用打包产物

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

### 用户认证
- 用户注册：用户名 + 密码
- 用户登录：返回 JWT Token
- JWT 有效期：24 小时
- 密码加密存储（bcrypt）

### Web 界面
- 登录/注册页面
- 左右布局：左侧年份导航，右侧统计内容
- 默认显示：打开页面自动加载最近年份数据
- 年份选择：点击左侧年份切换，按年份降序排列
- 学生搜索：支持按姓名模糊匹配
- 班级筛选：全部、classA-classG
- 成绩展示：显示学生成绩，按分数颜色区分
- 统计摘要：总人数、班级数、平均分、最高分
- 总排名前三名高亮显示
- 基于 Bootstrap 5 响应式布局

### REST API

#### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/me | 获取当前用户信息 |

#### 数据接口（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/years | 获取可用年份列表 |
| GET | /api/statistics/:year | 获取指定年份统计 |

---

## 数据说明

### 数据库表

**users 表**（用户）
- id, username, password

**ranking 表**（成绩）
- id, studentName, score, class, year

### 数据规模

- 班级：classA - classG（7个班级）
- 每班人数：10人
- 年份：2023-2026
- 每年数据：70条

---

## API 返回格式

### 注册/登录

```json
// 注册成功
{ "message": "注册成功", "userId": 1 }

// 登录成功
{ "message": "登录成功", "token": "eyJhbGci..." }
```

### 统计数据

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

---

## API 接口示例

```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 获取年份列表（需认证）
TOKEN="your-jwt-token"
curl http://localhost:3000/api/years \
  -H "Authorization: Bearer $TOKEN"

# 获取2024年统计（需认证）
curl http://localhost:3000/api/statistics/2024 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 依赖说明

### 主要依赖
- express: Web 框架
- mysql2: MySQL 数据库驱动
- sequelize: ORM 框架
- jsonwebtoken: JWT 认证
- bcrypt: 密码加密
- vue: 前端框架（CDN）
- bootstrap: UI 框架（CDN）
- bootstrap-icons: 图标库（CDN）
