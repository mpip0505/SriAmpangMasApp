import { Pool, PoolClient, QueryResult } from 'pg';

console.log('🔧 Initializing database connection...');
console.log('Config:', {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || '5432',
  database: process.env.DATABASE_NAME || 'residential_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD ? '***SET***' : '***EMPTY***',
});

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'residential_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', (client) => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: Error, client) => {
  console.error('❌ Database pool error:', err.message);
  console.error('Full error:', err);
});

pool.on('acquire', (client) => {
  console.log('📤 Database client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('📥 Database client removed from pool');
});

// Test connection immediately
(async () => {
  try {
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW() as time, current_user as user');
    console.log('✅ Database test query successful');
    console.log('   Time:', result.rows[0].time);
    console.log('   User:', result.rows[0].user);
  } catch (error: any) {
    console.error('❌ Database test query failed:', error.message);
    console.error('   Code:', error.code);
    console.error('   Detail:', error.detail);
  }
})();

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const transaction = async (callback: (client: PoolClient) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;