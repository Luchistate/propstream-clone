import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(__dirname, '../../../database/seeds/mock_properties.sql');

async function seed() {
  console.log('Seeding mock data...');

  const sql = fs.readFileSync(seedFile, 'utf-8');

  try {
    await query('BEGIN');
    await query(sql);
    await query('COMMIT');

    const count = await query('SELECT COUNT(*) FROM properties');
    console.log(`Seeded ${count.rows[0].count} properties.`);
  } catch (err) {
    await query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  }

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
