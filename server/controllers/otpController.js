const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../config/emailConfig');

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email helper
const sendOTPEmail = async (email, otp, name) => {
    const mailOptions = {
        from: `"UniGig" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your UniGig account',
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6C63FF; margin: 0; font-size: 28px;">UniGig</h1>
          <p style="color: #888; margin-top: 4px;">Email Verification</p>
        </div>
        <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
          <p style="color: #333; font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">Use the following code to verify your email address:</p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6C63FF, #5A52D5); color: white; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">
              ${otp}
            </div>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px; text-align: center; margin-bottom: 0;">If you didn't create a UniGig account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

// @desc    Send OTP to user email
// @route   POST /api/auth/send-otp
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate OTP and set 10-minute expiry
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send email
        await sendOTPEmail(user.email, otp, user.name);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Check if OTP exists
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
        }

        // Check if OTP has expired
        if (new Date() > user.otpExpires) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // OTP is valid — mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully!', isVerified: true });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};

module.exports = { sendOtp, verifyOtp, sendOTPEmail, generateOTP };
