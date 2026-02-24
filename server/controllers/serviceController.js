const Service = require('../models/Service');

// @desc    Create a new service/gig
// @route   POST /api/services
// @access  Private (Student Sellers only)
const createService = async (req, res) => {
    try {
        const { title, description, category, price, deliveryTime } = req.body;

        if (!title || !description || !category || !price || !deliveryTime) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const service = await Service.create({
            title,
            description,
            category,
            price,
            coverImage: req.file ? `/uploads/${req.file.filename}` : '',
            deliveryTime,
            seller: req.user._id,
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all services (with search & availability filter)
// @route   GET /api/services?search=&category=
// @access  Public
const getServices = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
            ];
        }

        if (category) {
            filter.category = category;
        }

        const services = await Service.find(filter)
            .populate('seller', 'name email universityDomain availability')
            .sort({ createdAt: -1 });

        // Filter out services from "Away" sellers
        const activeServices = services.filter(
            (s) => s.seller && s.seller.availability === 'Active'
        );

        res.json(activeServices);
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get services by current seller
// @route   GET /api/services/my
// @access  Private (Student Sellers only)
const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ seller: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(services);
    } catch (error) {
        console.error('Get my services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createService, getServices, getMyServices };
