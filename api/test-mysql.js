console.log('Starting MySQL database test...');

// Import required libraries
const mysql = require('mysql2/promise');
console.log('mysql2 module loaded successfully');

// Database connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'admin',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
};

console.log('Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  password: dbConfig.password ? '[HIDDEN]' : ''
});

// Function to test database connection
async function testConnection() {
  console.log('Creating connection pool...');
  try {
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    
    console.log('Connecting to database...');
    const connection = await pool.getConnection();
    console.log('✅ Connection successful!');
    
    // Execute simple query to verify connection
    console.log('Executing test query...');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Query result:', rows);
    
    connection.release();
    console.log('Connection released');
    
    // End the pool
    await pool.end();
    console.log('Connection pool ended');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('MySQL server is not running. Please start your MySQL server (XAMPP/WAMP).');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database "${dbConfig.database}" does not exist. Please create it first.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your username and password.');
    }
    return false;
  }
}

// Run the test
testConnection().then(success => {
  console.log('Database test completed with ' + (success ? 'SUCCESS' : 'FAILURE'));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}); 