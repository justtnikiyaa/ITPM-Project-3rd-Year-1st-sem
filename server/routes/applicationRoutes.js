const express = require('express');
const { protect, requireBuyer, requireStudent } = require('../middleware/auth');
const {
    createApplication,
    getApplicationsForJob,
    getSellerApplications,
    updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/', protect, requireStudent, createApplication);
router.get('/job/:jobId', protect, requireBuyer, getApplicationsForJob);
router.get('/seller', protect, requireStudent, getSellerApplications);
router.patch('/:id/status', protect, requireBuyer, updateApplicationStatus);

module.exports = router;
