const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

    ssl: { rejectUnauthorized: false },

  // timeout settings
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

pool.on("connect", () => {
  console.log("Connected to CockroachDB 🚀");
});

module.exports = pool;