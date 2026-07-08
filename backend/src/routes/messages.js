const express = require('express');
const router  = express.Router();
const {
  sendNow, scheduleMessage, getScheduled, cancelScheduled, getLogs,
  sendSMS, getSMSLogs, sendEmail, getEmailLogs,
} = require('../controllers/messageController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/send',               requireRole('messaging_manager'), sendNow);
router.post('/schedule',           requireRole('messaging_manager'), scheduleMessage);
router.get('/scheduled',           getScheduled);
router.delete('/scheduled/:id',    requireRole('messaging_manager'), cancelScheduled);
router.get('/logs',                getLogs);

router.post('/sms/send',           requireRole('messaging_manager'), sendSMS);
router.get('/sms/logs',            getSMSLogs);

router.post('/email/send',         requireRole('messaging_manager'), sendEmail);
router.get('/email/logs',          getEmailLogs);

module.exports = router;
