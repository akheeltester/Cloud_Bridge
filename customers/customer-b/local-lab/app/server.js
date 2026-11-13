'use strict';

const http = require('node:http');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 5,
  connectionTimeoutMillis: 3000
});

const PORT = Number(process.env.APP_PORT || 8080);

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, {
        company: 'ACME Technologies',
        application: 'ACME Internal Business Application',
        environment: 'local-migration-simulation',
        status: 'running',
        endpoints: ['/health', '/api/summary', '/api/employees']
      });
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      await pool.query('SELECT 1');
      return send(res, 200, { status: 'healthy', database: 'connected' });
    }

    if (req.method === 'GET' && url.pathname === '/api/summary') {
      const result = await pool.query(`
        SELECT department, COUNT(*)::int AS sample_employee_count
        FROM employees
        GROUP BY department
        ORDER BY department
      `);

      return send(res, 200, {
        company: 'ACME Technologies',
        represented_sample_records: result.rows.reduce(
          (total, row) => total + row.sample_employee_count, 0
        ),
        departments: result.rows
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/employees') {
      const result = await pool.query(`
        SELECT employee_id, name, department, role, employment_status
        FROM employees
        ORDER BY employee_id
      `);
      return send(res, 200, { count: result.rowCount, employees: result.rows });
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/employees/')) {
      const id = Number(url.pathname.split('/').pop());

      if (!Number.isInteger(id) || id < 1) {
        return send(res, 400, { error: 'Invalid employee ID' });
      }

      const result = await pool.query(
        `SELECT employee_id, name, department, role, employment_status
         FROM employees WHERE employee_id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return send(res, 404, { error: 'Employee not found' });
      }

      return send(res, 200, result.rows[0]);
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Request failed:', error.message);
    return send(res, 503, { error: 'Service temporarily unavailable' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ACME application listening on port ${PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
