const mongoose = require('mongoose');
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

        console.log(`[DEBUG] Service created successfully for seller: ${req.user._id}`);
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
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized, no user ID' });
        }

        const services = await Service.find({ seller: req.user._id }).sort({
            createdAt: -1,
        });

        res.json(services);
    } catch (error) {
        console.error('Get my services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate(
            'seller',
            'name email universityDomain availability'
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Get service by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a service/gig
// @route   PATCH /api/services/:id
// @access  Private (owner only)
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        if (!service.seller.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to edit this service' });
        }

        const {
            title,
            description,
            category,
            price,
            deliveryTime,
        } = req.body;

        // only update fields that were provided
        if (title !== undefined) service.title = title;
        if (description !== undefined) service.description = description;
        if (category !== undefined) service.category = category;
        if (price !== undefined) service.price = price;
        if (deliveryTime !== undefined) service.deliveryTime = deliveryTime;

        // handle image file if uploaded
        if (req.file) {
            service.coverImage = `/uploads/${req.file.filename}`;
        }

        const updated = await service.save();
        res.json(updated);
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a service/gig
// @route   DELETE /api/services/:id
// @access  Private (owner only)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        if (!service.seller.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this service' });
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createService,
    getServices,
    getMyServices,
    getServiceById,
    updateService,
    deleteService,
};
