const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getOrCreateChat, getUserChats, getChatMessages, updateChatNote } = require('../controllers/chatController');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for attachments
});

router.post('/', getOrCreateChat);
router.get('/user/:userId', getUserChats);
router.get('/:chatId/messages', getChatMessages);
router.patch('/:chatId/note', updateChatNote);

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
});

module.exports = router;
