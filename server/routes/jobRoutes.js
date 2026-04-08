const express = require('express');
const { protect, requireBuyer } = require('../middleware/auth');
const {
    createJob,
    getOpenJobs,
    getBuyerJobs,
    updateJobStatus,
    deleteJob,
} = require('../controllers/jobController');

const router = express.Router();

router.get('/', protect, getOpenJobs);
router.get('/buyer', protect, requireBuyer, getBuyerJobs);
router.post('/', protect, requireBuyer, createJob);
router.patch('/:id/status', protect, requireBuyer, updateJobStatus);
router.delete('/:id', protect, requireBuyer, deleteJob);

module.exports = router;
