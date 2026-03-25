const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ✅ VALIDATION: Name field - required and trimmed
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    // ✅ VALIDATION: Email field - required, unique, converted to lowercase
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // ✅ VALIDATION: Password field - required, minimum 6 characters
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    isStudentSeller: {
      type: Boolean,
      default: false,
    },
    universityDomain: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      enum: ['Active', 'Away'],
      default: 'Active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: '',
    },
    // ✅ VALIDATION: Bio - max 500 characters
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // ✅ VALIDATION: Skills array - seller profile field
    skills: {
      type: [String],
      default: [],
    },
    // ✅ VALIDATION: Portfolio Summary - max 300 characters
    portfolioSummary: {
      type: String,
      default: '',
      maxlength: 300,
    },
    // ✅ VALIDATION: Budget Preference - max 120 characters
    budgetPreference: {
      type: String,
      default: '',
      maxlength: 120,
    },
  },
  { timestamps: true }
);

// ✅ VALIDATION: Hash password before saving (security middleware)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
