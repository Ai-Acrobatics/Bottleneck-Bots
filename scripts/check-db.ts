import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    // List tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('Tables in Supabase:', tables.rows.map(r => r.table_name).join(', ') || '(none)');

    // Check users table columns
    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('\nusers table columns:');
    cols.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type} ${r.is_nullable === 'YES' ? '(nullable)' : ''}`));

  } catch(err: any) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
