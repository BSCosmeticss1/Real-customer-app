const express = require("express");
const router = express.Router();
const {
  getStats,
  getRecentActivity,
  getCashFlow,
  getScheduledCount,
} = require("../controllers/dashboardController");
const { protect, requireRole } = require("../middleware/auth");
const { requireFeature } = require("../middleware/features");

router.use(protect);

// Stats and activity: accessible to admin + finance + inventory (all roles see their own slice)
router.get("/stats", getStats);
router.get("/activity", getRecentActivity);
router.get("/scheduled", getScheduledCount);

// Cash flow: only finance team and admin
router.get("/cashflow", requireRole("FINANCE_MANAGER"), requireFeature("finance"), getCashFlow);

module.exports = router;
