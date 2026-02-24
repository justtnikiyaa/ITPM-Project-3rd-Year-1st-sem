const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, generateOTP } = require('./otpController');

// Sri Lankan university email regex
const sriLankaUniRegex =
    /(@.*\.ac\.lk$|@my\.sliit\.lk$|@students\.nsbm\.ac\.lk$|@nsbm\.ac\.lk$|@kdu\.ac\.lk$|@cinec\.edu$)/;

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            isStudentSeller: user.isStudentSeller,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: 'Please provide name, email, and password' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine student seller status from email
        const isStudentSeller = sriLankaUniRegex.test(email);

        // Extract university domain if student
        let universityDomain = '';
        if (isStudentSeller) {
            universityDomain = email.split('@')[1];
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            isStudentSeller,
            universityDomain,
            otp,
            otpExpires,
        });

        // Send OTP email in background (don't block the registration response)
        sendOTPEmail(user.email, otp, user.name).catch((emailErr) => {
            console.error('Failed to send OTP email:', emailErr.message);
        });

        const token = generateToken(user);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isStudentSeller: user.isStudentSeller,
            universityDomain: user.universityDomain,
            availability: user.availability,
            isVerified: user.isVerified,
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isStudentSeller: user.isStudentSeller,
            universityDomain: user.universityDomain,
            availability: user.availability,
            isVerified: user.isVerified,
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
