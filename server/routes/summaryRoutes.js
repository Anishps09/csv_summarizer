const express = require("express");
const router = express.Router();

const {
  createSummary,
  getSummaries,
    getSummaryById
} = require("../controllers/summaryController");

router.post("/summaries", createSummary);
router.get("/summaries", getSummaries);
router.get("/summaries/:id", getSummaryById);   

module.exports = router;