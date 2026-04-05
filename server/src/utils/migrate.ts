import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../../../database/migrations');

async function migrate() {
  console.log('Running migrations...');

  // Create migrations tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Get already-applied migrations
  const applied = await query<{ filename: string }>('SELECT filename FROM _migrations ORDER BY filename');
  const appliedSet = new Set(applied.rows.map(r => r.filename));

  // Read and sort migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  Skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  Applying ${file}...`);

    try {
      await query('BEGIN');
      await query(sql);
      await query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await query('COMMIT');
      console.log(`  ✓ ${file} applied`);
    } catch (err) {
      await query('ROLLBACK');
      console.error(`  ✗ ${file} failed:`, err);
      throw err;
    }
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
