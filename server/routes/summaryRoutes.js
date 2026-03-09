const express = require("express");
const multer = require("multer");

const {
  createSummary,
  getSummaries,
  getSummaryById,
  deleteSummary
} = require("../controllers/summaryController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/summaries", upload.single("file"), createSummary);

router.get("/summaries", getSummaries);

router.get("/summaries/:id", getSummaryById);

router.delete("/summaries/:id", deleteSummary);

module.exports = router;