const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');

// @desc    Toggle user availability (Active <-> Away)
// @route   PATCH /api/users/availability
// @access  Private (Student Sellers only)
// ✅ SELLER ACTIVE/NON-ACTIVE STATUS - TOGGLE ENDPOINT
const toggleAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // ✅ VALIDATION: Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ LOGIC: Toggle between 'Active' and 'Away' status
        // When 'Away', seller's gigs won't show on home page
        user.availability = user.availability === 'Active' ? 'Away' : 'Active';
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isStudentSeller: user.isStudentSeller,
            availability: user.availability,
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user account and all related data
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. If seller, delete all their services
        if (req.user.isStudentSeller) {
            await Service.deleteMany({ seller: userId });
        }

        // 2. Delete all reviews written by this user
        await Review.deleteMany({ buyer: userId });

        // 3. Delete reviews written *about* this seller (if applicable)
        await Review.deleteMany({ seller: userId });

        // 4. Finally, delete the user themselves
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { toggleAvailability, deleteAccount };
