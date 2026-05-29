const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const socketIo = require('./socket');
const http = require('http');

const app = express();
let httpServer = http.createServer(app);
const io = socketIo(httpServer);
let shuttingDown = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    // Health check
    app.get('/', (req, res) => {
        res.json({ message: 'UniGig API is running' });
    });
}

// Global error handling middleware (handles Multer errors and others gracefully)
const multer = require('multer');
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum size allowed is 15MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    console.error('Unhandled server error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    const finish = () => {
        if (signal === 'SIGUSR2') {
            process.kill(process.pid, 'SIGUSR2');
            return;
        }
        process.exit(0);
    };

    const forceCloseTimer = setTimeout(() => {
        process.exit(1);
    }, 5000);
    forceCloseTimer.unref();

    const closeDbAndExit = () => {
        mongoose.connection.close(false)
            .then(finish)
            .catch(() => finish());
    };

    if (httpServer) {
        httpServer.close(() => {
            closeDbAndExit();
        });
        return;
    }

    closeDbAndExit();
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGUSR2', () => shutdown('SIGUSR2'));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        httpServer.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
            } else {
                console.error('❌ Server error:', err.message);
            }
            process.exit(1);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
