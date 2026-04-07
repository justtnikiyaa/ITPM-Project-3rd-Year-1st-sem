const User = require('../models/User');

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

module.exports = { toggleAvailability };
