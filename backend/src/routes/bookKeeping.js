const express = require('express');
const router = express.Router();
const { protect, requireRole, authorizeFeature } = require('../middleware/auth');
const {
  getBookKeeping,
  createBookKeeping,
  getBookKeepingSummary,
} = require('../controllers/bookKeepingController');

router.use(protect);

router.get('/', requireRole('ADMIN', 'AUDITOR'), getBookKeeping);
router.post('/', requireRole('ADMIN'), createBookKeeping);
router.get('/summary', requireRole('ADMIN', 'AUDITOR'), getBookKeepingSummary);

module.exports = router;
