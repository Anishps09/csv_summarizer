const pool = require("./db");

async function testDB() {
  try {
    const result = await pool.query("SELECT now()");
    console.log("DB Time:", result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
  }
}

testDB();