import { Pool, QueryResult } from "pg";
import { getEnv } from "../utils/env";

const pool = new Pool({
    host: getEnv("DB_HOST") || 'localhost',
    port: parseInt(getEnv("DB_PORT") || '5432'),
    database: getEnv("DB_NAME"),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000,  // Return error after 2 seconds if can't connect
});


export const query = async(text: string, params?: any[]): Promise<QueryResult> => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now();
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export const getClient = () => pool.connect();

export const closePool = async () => {
    await pool.end();
    console.log('Databse pool closed')
};

export default pool;