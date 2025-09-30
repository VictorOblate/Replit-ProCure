import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const url = new URL(process.env.DATABASE_URL);
  const database = url.pathname.slice(1);
  
  // Create connection without database
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    port: parseInt(url.port || '3306'),
  });

  try {
    console.log(`Dropping database ${database} if exists...`);
    await connection.execute(`DROP DATABASE IF EXISTS ${database}`);
    
    console.log(`Creating database ${database}...`);
    await connection.execute(`CREATE DATABASE ${database}`);
    
    console.log('Database reset successful');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

resetDatabase().catch(console.error);