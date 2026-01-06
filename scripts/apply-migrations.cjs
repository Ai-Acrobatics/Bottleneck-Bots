const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration(filename) {
  const sql = fs.readFileSync(filename, 'utf8');
  // Split by statement breakpoint marker
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const statement of statements) {
    if (!statement) continue;
    try {
      await pool.query(statement);
      success++;
    } catch (err) {
      if (err.code === '42P07') { // table already exists
        skipped++;
      } else if (err.code === '42701') { // column already exists
        skipped++;
      } else if (err.code === '42710') { // constraint already exists
        skipped++;
      } else if (err.code === '42P01') { // table doesn't exist (for ALTER)
        console.log('  ⚠ Table not found:', err.message.substring(0, 80));
        errors++;
      } else {
        console.log('  ✗ Error:', err.code, err.message.substring(0, 100));
        errors++;
      }
    }
  }

  console.log(`  ✓ ${success} executed, ${skipped} skipped, ${errors} errors`);
}

async function main() {
  const files = [
    'drizzle/0001_moaning_annihilus.sql',
    'drizzle/0002_webhooks_and_task_board.sql',
    'drizzle/0003_fair_grey_gargoyle.sql',
    'drizzle/0004_chilly_iron_lad.sql',
    'drizzle/0005_eager_true_believers.sql',
    'drizzle/0006_claude_flow_schemas.sql',
  ];

  console.log('Starting migrations...\n');

  for (const file of files) {
    console.log(`=== ${file} ===`);
    await runMigration(file);
  }

  // Get final table count
  const result = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('\nTotal tables:', result.rows.length);
  console.log('Tables:', result.rows.map(r => r.tablename).join(', '));

  pool.end();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  pool.end();
  process.exit(1);
});
