# AGENTS.md - Agent Coding Guidelines

## Project Overview

Node.js + Express MySQL ranking statistics project with a Vue 3 web frontend. Provides student ranking statistics by year and class via REST API and web UI.

## Build/Lint/Test Commands

```bash
# Run all tests (creates table, inserts data, verifies all years)
node test.js

# Run the application
npm start              # Development (port 3000)
npm run start:prod    # Production config

# Build production tarball
tar -czvf ranking-system.tar.gz \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  server.js config.prod.json public/ test.js \
  package.json package-lock.json node_modules/

# PM2 production management
pm2 start server.js --name ranking -- --prod
pm2 status
pm2 logs ranking
pm2 restart ranking
pm2 stop ranking
```

## Code Style Guidelines

### General Principles
- Keep code concise and readable
- No comments unless explicitly required by the user
- Use async/await for all asynchronous operations

### Imports (CommonJS)
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
```

### Naming Conventions
- **Variables/Functions**: camelCase (`getStatistics`, `classRankingMap`)
- **Files**: camelCase (`server.js`, `test.js`)
- **API Endpoints**: lowercase with hyphens
- **Database tables**: lowercase (`ranking`)
- **Database columns**: camelCase (`studentName`, `className`)

### Formatting
- 2 spaces for indentation
- No trailing semicolons (optional)
- Use template literals for string interpolation
- One blank line between function definitions

### Error Handling
- Always use `.catch(console.error)` or try-catch for async functions
- Exit with error code- Return proper HTTP for critical failures
 status codes in API responses
```javascript
main().catch(console.error);
res.status(500).json({ error: error.message });
```

### Database
- Use `connection.execute()` for parameterized queries
- Always close connections with `await connection.end()`
- Never concatenate SQL; use parameterized queries

## Frontend Guidelines

- Vue 3 Composition API via CDN
- Bootstrap 5 for styling via CDN
- Separate files under `public/`:
  - `public/index.html` - Main HTML
  - `public/css/style.css` - Styles
  - `public/js/app.js` - Vue 3 application logic
- Use `setup()`, `ref()`, `computed()` from Vue 3

## Project Structure
```
├── server.js
├── config.json / config.prod.json
├── models/
│   ├── database.js
│   ├── ranking.js
│   └── user.js
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── test.js
├── README.md
├── AGENTS.md
└── package.json
```

## Database Schema
```sql
CREATE TABLE ranking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentName VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  class VARCHAR(255) NOT NULL,
  year INT NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
```

## Configuration

Two config files: `config.json` (dev), `config.prod.json` (prod). Load with:
```javascript
const isProduction = process.argv.includes('--prod');
const config = JSON.parse(fs.readFileSync(
  isProduction ? 'config.prod.json' : 'config.json', 'utf8'
));
```

## REST API

- Auth (public): `POST /api/auth/register`, `POST /api/auth/login`
- Data (auth required): `GET /api/years`, `GET /api/statistics/:year`
- Use Bearer token for authentication

## Testing Guidelines
- Create/reset tables with DROP + CREATE
- Verify ranking values and ranges
- Test all years (2023-2026)
- Verify API responses when server is running

## Dependencies
- express, mysql2, sequelize, jsonwebtoken, bcrypt
- Vue 3, Bootstrap 5, Bootstrap Icons (via CDN)
