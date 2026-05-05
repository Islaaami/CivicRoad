const express = require("express");
const upload = require("../middleware/upload");
const {
  getReports,
  getReportsMap,
  getReport,
  createReport,
  updateReport,
  updateReportStatus,
  updateReportPriority,
  deleteReport,
} = require("../controllers/reportController");
const { markReportAsFalse } = require("../controllers/falseReportController");

const router = express.Router();

router.get("/", getReports);
router.get("/map", getReportsMap);
router.get("/:id", getReport);
router.post("/", upload.single("image"), createReport);
router.post("/:id/false", markReportAsFalse);
router.patch("/:id", updateReport);
router.patch("/:id/status", updateReportStatus);
router.patch("/:id/priority", updateReportPriority);
router.delete("/:id", deleteReport);

module.exports = router;
