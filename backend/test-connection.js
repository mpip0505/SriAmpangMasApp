// test-connection.js
const { Pool } = require('pg');
const { createClient } = require('redis');

async function testConnections() {
  // Test PostgreSQL
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'residential_db',
    user: 'postgres',
    password: 'Mpip@0505', // Use your password
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ PostgreSQL error:', err.message);
  }
  await pool.end();

  // Test Redis
  const redis = createClient();
  redis.on('error', err => console.error('❌ Redis error:', err.message));
  
  try {
    await redis.connect();
    await redis.set('test', 'hello');
    const value = await redis.get('test');
    console.log('✅ Redis connected:', value);
    await redis.disconnect();
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  }
}

testConnections();