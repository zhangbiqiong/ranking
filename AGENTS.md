# AGENTS.md - Agent Coding Guidelines

## Project Overview

This is a Node.js + Express MySQL ranking statistics project with a web frontend. It provides student ranking statistics by year and class via REST API and web UI.

## Build/Lint/Test Commands

### Running Tests
```bash
node test.js        # Run all tests (creates table, inserts data, verifies results)
```

### Running the Application
```bash
npm start              # Start Express server (default port: 3000)
npm run start:prod    # Start with production config
```

### Building for Production
```bash
# Create tarball (includes node_modules)
tar -czvf ranking-system.tar.gz \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  server.js config.prod.json public/ test.js \
  package.json package-lock.json node_modules/
```

### PM2 Commands (Production)
```bash
# Start with pm2
pm2 start server.js --name ranking -- --prod

# Other commands
pm2 status
pm2 logs ranking
pm2 restart ranking
pm2 stop ranking
```

### Dependencies
- express: Web framework
- mysql2: MySQL database driver (use `mysql2/promise` for async/await)

## Code Style Guidelines

### General Principles
- Keep code concise and readable
- No comments unless explicitly required by the user
- Use async/await for all asynchronous operations

### Imports
- Use CommonJS `require()` for Node.js modules
- Use `mysql2/promise` for database connections
- Use `express` for web server
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
```

### Database Connection
- Always close connections with `await connection.end()`
- Use parameterized queries to prevent SQL injection
```javascript
const [rows] = await connection.execute(query, params);
```

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `getStatistics`, `classRankingMap`)
- **Constants**: camelCase or UPPER_SNAKE_CASE for configuration
- **Files**: camelCase (e.g., `server.js`, `test.js`)
- **API Endpoints**: RESTful, lowercase with hyphens
**: lowercase (- **Database tablese.g., `ranking`)
- **Database columns**: camelCase (e.g., `studentName`, `className`)

### Error Handling
- Always use `.catch(console.error)` or try-catch blocks for async functions
- Exit with error code for critical failures
- Return proper HTTP status codes in API
```javascript
main().catch(console.error);
// API error handling
res.status(500).json({ error: error.message });
```

### Type Conventions
- No TypeScript in this project
- MySQL INT maps to JavaScript number

### Formatting
- Use 2 spaces for indentation
- No trailing semicolons (optional in Node.js)
- Use template literals for string interpolation
- One blank line between function definitions

### Project Structure
```
├── server.js              # Express backend server
├── config.json            # Development config
├── config.prod.json       # Production config
├── public/
│   └── index.html         # Vue 3 frontend (Bootstrap 5)
├── test.js                # Test script with verification
├── README.md              # Project documentation
├── AGENTS.md              # Agent coding guidelines
├── opencode.jsonc         # OpenCode configuration (MCP)
├── package.json
└── node_modules/
```

### Database Schema
```sql
CREATE TABLE ranking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentName VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  class VARCHAR(255) NOT NULL,
  year INT NOT NULL
);
```

### Configuration
Two configuration files:
- `config.json` - Development environment
- `config.prod.json` - Production environment (used for packaged executable)

```json
{
  "db": {
    "host": "test-mysql.anytrek.app",
    "user": "zhangbiqiong",
    "password": "Zbq20240614",
    "database": "zbqdemo"
  },
  "server": {
    "port": 3000
  }
}
```

Load configuration in server.js:
```javascript
const fs = require('fs');
const isProduction = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const configFile = isProduction ? 'config.prod.json' : 'config.json';
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const dbConfig = config.db;
const PORT = config.server.port;
```

### REST API Design
- Use RESTful conventions
- Return JSON responses
- Use appropriate HTTP status codes
- Endpoint examples:
  - `GET /api/years` - Get available years
  - `GET /api/statistics/:year` - Get statistics for a year

### Web Static Files
- Serve static files from `public/` directory
- Use middleware: `app.use(express.static('public'))`

### Testing Guidelines
- Tests should create/reset database tables using DROP + CREATE
- Include verification logic to check result accuracy
- Verify both ranking values and their ranges
- Test all years (2023-2026)
- Verify API responses when server is running

### Best Practices
1. Use `connection.execute()` for parameterized queries
2. Close database connections after use
3. Use Maps for efficient lookups when processing results
4. Avoid SQL concatenation; use parameterized queries always
5. Serve frontend from `/public` directory
