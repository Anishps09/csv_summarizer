const pool = require("../db");
const logger = require("../utils/logger");

exports.createSummary = async (req, res) => {

  const { filename, summary, row_count, file_size } = req.body;

  if (!filename || !summary) {
    logger.warn("Invalid request: missing filename or summary");
    return res.status(400).json({ error: "filename and summary required" });
  }

  try {

    const result = await pool.query(
      `INSERT INTO summaries 
       (filename, summary, row_count, file_size)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [filename, summary, row_count, file_size]
    );

    logger.info(`Summary stored for file: ${filename}`);

    res.status(201).json(result.rows[0]);

  } catch (err) {

    logger.error(`Database insert failed: ${err.message}`);

    res.status(500).json({
      error: "Internal server error"
    });

  }
};