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
        minVersion: 'TLSv1.2',
    },
    connectionUrl: 'smtp://user@gmail.com:pass@smtp.gmail.com:587',
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter error:', error.message);
        console.error('   Code:', error.code);
        if (error.code === 'EAUTH') {
            console.error('   → Invalid email credentials. Check EMAIL_USER and EMAIL_PASS in .env');
        }
    } else {
        console.log('✅ Email transporter ready');
        console.log('   Using:', process.env.EMAIL_USER);
    }
});

module.exports = transporter;
