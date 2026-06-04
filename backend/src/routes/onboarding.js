const express = require('express');
const router = express.Router();
const { updateOnboardingDetails, getOnboardingStatus } = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/status', getOnboardingStatus);
router.put('/details', updateOnboardingDetails);

module.exports = router;
