const { Pool } = require("pg");

const devConfig = {
  user: process.env.PGUSER ,      // Use environment variable or fallback to 'postgres'
  password: process.env.PGPASSWORD , // Use environment variable or fallback to 'root'
  host: process.env.PGHOST ,    // Use environment variable or fallback to 'localhost'
  database: process.env.PGDATABASE , // Use environment variable or fallback to 'EventHiveDB'
  port: process.env.PGPORT ,           // Use environment variable or fallback to 5432
  ssl: false                                  // Disable SSL for development
};
 
const proConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false            
  }
};

// Determine environment mode
const pool = new Pool(process.env.NODE_ENV === "production" ? proConfig : devConfig);

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
};
