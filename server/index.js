require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const logger = require("./utils/logger");

const pool = require("./db");
const router = require("./routes/summaryRoutes");

const app = express();

app.use(express.json());

// HTTP logs
app.use(morgan("combined"));

app.use("/api", router);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT now()");
    res.json({
      message: "Server is running 🚀",
      dbTime: result.rows[0],
    });
  } catch (err) {
    logger.error(`DB error: ${err.message}`);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});