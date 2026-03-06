const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createService,
    getServices,
    getMyServices,
    getServiceById,
    updateService,
    deleteService,
} = require('../controllers/serviceController');
const { protect, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const extname = allowed.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Public - get all services
router.get('/', getServices);

// Private - get current seller's services (must appear before '/:id'!
// otherwise 'my' is treated as an id and will 404)
router.get('/my', protect, requireStudent, getMyServices);

// Public - get single service by id
router.get('/:id', getServiceById);

// Private - update/delete service by id (only owner)
router.patch('/:id', protect, requireStudent, upload.single('coverImage'), updateService);
router.delete('/:id', protect, requireStudent, deleteService);

// Private - create service (student sellers only)
router.post('/', protect, requireStudent, upload.single('coverImage'), createService);

module.exports = router;
