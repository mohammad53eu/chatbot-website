import { query } from './db';



const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

testConnection();