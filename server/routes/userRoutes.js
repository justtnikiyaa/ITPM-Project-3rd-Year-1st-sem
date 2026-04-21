const express = require('express');
const { toggleAvailability, deleteAccount } = require('../controllers/userController');
const { protect, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Toggle availability (Active <-> Away) - student sellers only
router.patch('/availability', protect, requireStudent, toggleAvailability);

// Delete account - any authenticated user
router.delete('/me', protect, deleteAccount);

module.exports = router;
