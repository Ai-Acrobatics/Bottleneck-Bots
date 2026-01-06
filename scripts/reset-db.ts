import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Dropping existing tables...');

    // Drop tables in order (handle foreign key constraints)
    const dropQueries = [
      'DROP TABLE IF EXISTS bot_runs CASCADE',
      'DROP TABLE IF EXISTS bots CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
    ];

    for (const query of dropQueries) {
      await pool.query(query);
      console.log(`  ✓ ${query}`);
    }

    console.log('\n✅ Tables dropped successfully!');
    console.log('Now run: pnpm db:push');

  } catch(err: any) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
