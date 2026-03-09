const fs = require("fs");
const { parse } = require("csv-parse");
const pool = require("../db");
const logger = require("../utils/logger");

exports.createSummary = async (req, res) => {

  const file = req.file;

  if (!file.originalname.toLowerCase().endsWith(".csv")) {
  logger.warn(`Invalid file type uploaded: ${file.originalname}`);

  fs.unlink(file.path, () => {}); // delete invalid upload

  return res.status(400).json({
    error: "Only CSV files are allowed"
  });
}

  if (!file) {
    logger.warn("No CSV file uploaded");
    return res.status(400).json({ error: "CSV file required" });
  }

  let row_count = 0;
  let column_count = 0;

  try {

    fs.createReadStream(file.path)
      .pipe(parse({ columns: true, trim: true }))

      .on("data", (row) => {

        row_count++;

        if (row_count === 1) {
          column_count = Object.keys(row).length;
        }

      })

      .on("end", async () => {

        const filename = file.originalname;
        const file_size = file.size;

        const summary =
          `CSV contains ${row_count} rows and ${column_count} columns`;

        const result = await pool.query(
          `INSERT INTO summaries 
           (filename, summary, row_count, file_size)
           VALUES ($1,$2,$3,$4)
           RETURNING *`,
          [filename, summary, row_count, file_size]
        );

        logger.info(`Summary stored for file: ${filename}`);

        res.status(201).json(result.rows[0]);

        fs.unlink(file.path, () => {}); // delete uploaded file

      })

      .on("error", (err) => {

  logger.error(`CSV parse error: ${err.message}`);

  fs.unlink(file.path, () => {}); // cleanup on error

  res.status(500).json({
    error: "CSV processing failed"
  });

});

  } catch (err) {

    logger.error(`Processing failed: ${err.message}`);

    res.status(500).json({
      error: "Internal server error"
    });

  }

};

exports.getSummaries = async (req, res) => {
  try {

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT * 
       FROM summaries
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    logger.info(`Fetched summaries with limit=${limit} offset=${offset}`);

    res.status(200).json({
      limit,
      offset,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {

    logger.error(`Failed to fetch summaries: ${err.message}`);

    res.status(500).json({
      error: "Failed to fetch summaries"
    });

  }
};

exports.getSummaryById = async (req, res) => {
  const { id } = req.params;

  try {

    const result = await pool.query(
      "SELECT * FROM summaries WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn(`Summary not found for id: ${id}`);

      return res.status(404).json({
        error: "Summary not found"
      });
    }

    logger.info(`Fetched summary id: ${id}`);

    res.status(200).json(result.rows[0]);

  } catch (err) {

    logger.error(`Failed to fetch summary ${id}: ${err.message}`);

    res.status(500).json({
      error: "Failed to fetch summary"
    });

  }
};

exports.deleteSummary = async (req, res) => {
  const { id } = req.params;

  try {

    const result = await pool.query(
      "DELETE FROM summaries WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {

      logger.warn(`Delete failed. Summary not found: ${id}`);

      return res.status(404).json({
        error: "Summary not found"
      });

    }

    logger.info(`Deleted summary id: ${id}`);

    res.status(200).json({
      message: "Summary deleted successfully",
      data: result.rows[0]
    });

  } catch (err) {

    logger.error(`Delete failed for ${id}: ${err.message}`);

    res.status(500).json({
      error: "Failed to delete summary"
    });

  }
};