const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 DNS resolution (fixes ENETUNREACH on IPv6-only networks)
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Verify connection on startup
transporter.verify((error) => {
    if (error) {
        console.error('❌ Email transporter error:', error.message);
    } else {
        console.log('✅ Email transporter ready');
    }
});

module.exports = transporter;
