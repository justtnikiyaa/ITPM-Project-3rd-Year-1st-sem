const express = require('express');
const { toggleAvailability } = require('../controllers/userController');
const { protect, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Toggle availability (Active <-> Away) - student sellers only
router.patch('/availability', protect, requireStudent, toggleAvailability);

module.exports = router;
