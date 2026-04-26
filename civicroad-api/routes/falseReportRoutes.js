const express = require("express");
const { getFalseReports } = require("../controllers/falseReportController");

const router = express.Router();

router.get("/", getFalseReports);

module.exports = router;
