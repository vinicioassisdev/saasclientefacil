import { Pool } from 'pg';

// Use a global variable to store the pool instance in development
// to prevent multiple connections during hot-reloading
let pool: Pool;

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL environment variable is not set.");
}

const connectionString = process.env.DATABASE_URL;

if (!pool) {
    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }, // Necessary for some cloud providers like Neon/Heroku
        max: 20, // Set pool max size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

export default pool;
