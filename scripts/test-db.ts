
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

async function testConnection() {
    console.log("Testing database connection...");
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error("❌ DATABASE_URL is not defined in environment");
        process.exit(1);
    }

    console.log(`URL Prefix: ${dbUrl.substring(0, 25)}...`);

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to database!");

        const res = await client.query('SELECT NOW()');
        console.log("Current Database Time:", res.rows[0].now);

        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    }
}

testConnection();
