console.log('Starting database test...');

// Import required libraries
require('dotenv').config();
const mysql = require('mysql2/promise');
console.log('mysql2 module loaded successfully');

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'undefined');
console.log('DB_NAME:', process.env.DB_NAME || 'undefined');
console.log('DB_USER:', process.env.DB_USER || 'undefined');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : 'undefined');

// Function to test database connection
async function testConnection() {
  console.log('Creating connection pool...');
  try {
    // Create connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'admin',
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0
    });
    
    console.log('Connecting to database...');
    const connection = await pool.getConnection();
    console.log('✅ Connection successful!');
    
    // Execute simple query to verify connection
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Query executed successfully:', rows);
    
    connection.release();
    console.log('Connection released');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('MySQL server is not running. Please start your MySQL server.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database "admin" does not exist. Please create it first.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your username and password.');
    }
    return false;
  }
}

// Run the test
testConnection().then(() => {
  console.log('Database test completed');
  process.exit(0);
}).catch(error => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}); 