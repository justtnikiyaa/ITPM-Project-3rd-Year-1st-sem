const express = require('express');
const router = express.Router();
const { getOrCreateChat, getUserChats, getChatMessages } = require('../controllers/chatController');

router.post('/', getOrCreateChat);
router.get('/user/:userId', getUserChats);
router.get('/:chatId/messages', getChatMessages);

module.exports = router;
