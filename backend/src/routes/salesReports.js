const express = require('express');
const router = express.Router();
const salesReportController = require('../controllers/salesReportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', salesReportController.getSalesReports);
router.get('/stats', salesReportController.getSalesStats);
router.post('/', salesReportController.createSalesReport);
router.put('/:id', salesReportController.updateSalesReport);
router.delete('/:id', salesReportController.deleteSalesReport);

module.exports = router;
