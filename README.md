# 学生成绩排名统计系统

## 项目介绍

这是一个基于 Node.js + Express + Vue 3 的学生成绩排名统计系统，提供 Web 页面展示和 REST API 接口。

## 项目结构

```
├── server.js           # Express 后端服务
├── public/
│   └── index.html     # Vue 3 前端页面
├── test.js    # 测试脚本
├── README.md # 项目文档
├── package.json
└── node_modules/
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
node server.js
```

服务启动后，访问 http://localhost:3000

### 3. 访问系统

打开浏览器访问 http://localhost:3000 ，选择年份即可查看成绩排名。

## 功能特性

### Web 界面
- 年份选择下拉框
- 班级筛选按钮（全部、classA-classG）
- 成绩排名表格展示
- 总排名前三名高亮显示（金、银、铜色）
- 加载状态和错误提示

### REST API

#### 获取年份列表
```
GET /api/years
```

#### 获取指定年份统计
```
GET /api/statistics/:year
```

## 数据说明

- **数据库**: test-mysql.anytrek.app
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
| class_ranking | number | 班级排名（1-10） |
| total_ranking | number | 总排名（1-70） |

## 运行测试

```bash
node test.js
```

测试内容包括：
- 数据库连接验证
- 统计数据格式验证
- 排名准确性验证
- 字段完整性验证

## API 接口示例

```bash
# 获取年份列表
curl http://localhost:3000/api/years

# 获取2024年统计
curl http://localhost:3000/api/statistics/2024
```
