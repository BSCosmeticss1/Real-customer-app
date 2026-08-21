const express = require("express");
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/financeController");
const { protect, requireRole } = require("../middleware/auth");
const { requireFeature } = require("../middleware/features");

router.use(protect, requireRole("FINANCE_MANAGER"), requireFeature("finance"));

router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").put(updateExpense).delete(deleteExpense);

module.exports = router;
