import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import listRoutes from './routes/list.routes.js';
import skipTraceRoutes from './routes/skipTrace.routes.js';
import dialerRoutes from './routes/dialer.routes.js';
import { pool, query } from './config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Auto-run migrations on startup
async function runMigrations() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const migrationsDir = path.resolve(__dirname, '../../database/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, skipping');
      return;
    }

    const applied = await query<{ filename: string }>('SELECT filename FROM _migrations ORDER BY filename');
    const appliedSet = new Set(applied.rows.map(r => r.filename));

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (appliedSet.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`  Applying migration: ${file}...`);
      try {
        await query('BEGIN');
        await query(sql);
        await query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await query('COMMIT');
      } catch (err) {
        await query('ROLLBACK');
        console.error(`  Migration ${file} failed:`, err);
      }
    }
    console.log('Migrations complete');
  } catch (err) {
    console.error('Migration check failed (DB may not be ready yet):', (err as Error).message);
  }
}

// Auto-seed mock data if DB is empty
async function autoSeed() {
  try {
    const count = await query('SELECT COUNT(*) FROM properties');
    if (parseInt(count.rows[0].count, 10) === 0) {
      const seedFile = path.resolve(__dirname, '../../database/seeds/mock_properties.sql');
      if (fs.existsSync(seedFile)) {
        console.log('Seeding mock data...');
        const sql = fs.readFileSync(seedFile, 'utf-8');
        await query('BEGIN');
        await query(sql);
        await query('COMMIT');
        const newCount = await query('SELECT COUNT(*) FROM properties');
        console.log(`Seeded ${newCount.rows[0].count} properties`);
      }
    }
  } catch (err) {
    console.error('Auto-seed failed:', (err as Error).message);
  }
}

// Global middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/skip-trace', skipTraceRoutes);
app.use('/api/dialer', dialerRoutes);

// Serve React frontend in production
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  await runMigrations();
  await autoSeed();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`Frontend: ${fs.existsSync(clientDist) ? 'serving from ' + clientDist : 'not built (use dev proxy)'}`);
  });
}

start();

export default app;
