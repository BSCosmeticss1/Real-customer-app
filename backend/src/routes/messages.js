const express = require('express');
const router  = express.Router();
const {
  sendNow, scheduleMessage, getScheduled, cancelScheduled, getLogs,
} = require('../controllers/messageController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/send',               requireRole('messaging_manager'), sendNow);
router.post('/schedule',           requireRole('messaging_manager'), scheduleMessage);
router.get('/scheduled',           getScheduled);
router.delete('/scheduled/:id',    requireRole('messaging_manager'), cancelScheduled);
router.get('/logs',                getLogs);

module.exports = router;
