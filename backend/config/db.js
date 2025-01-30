const { Pool } = require("pg");

const devConfig = {
  user: process.env.PGUSER || 'postgres',      // Use environment variable or fallback to 'postgres'
  password: process.env.PGPASSWORD || 'root', // Use environment variable or fallback to 'root'
  host: process.env.PGHOST || 'localhost',    // Use environment variable or fallback to 'localhost'
  database: process.env.PGDATABASE || 'eventhivedb', // Use environment variable or fallback to 'EventHiveDB'
  port: process.env.PGPORT || 5432,           // Use environment variable or fallback to 5432
  ssl: false                                  // Disable SSL for development
};

const proConfig = {
  connectionString: "postgres://postgres:root@localhost:5432/eventhivedb", // Use DATABASE_URL environment variable in production
  ssl: {
    rejectUnauthorized: false                 // For hosted databases (e.g., Heroku, AWS RDS)
  }
};

// Determine environment mode
const pool = new Pool(process.env.NODE_ENV === "production" ? proConfig : devConfig);

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
};
