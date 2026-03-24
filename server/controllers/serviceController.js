const mongoose = require('mongoose');
const Service = require('../models/Service');

const toDeliveryLabel = (days) => {
    const num = Number(days);
    if (!num || Number.isNaN(num)) return '1 Week';
    return `${num} ${num === 1 ? 'Day' : 'Days'}`;
};

const normalizeService = (serviceDoc) => {
    const service = serviceDoc.toObject ? serviceDoc.toObject() : { ...serviceDoc };
    const packages = Array.isArray(service.packages) ? service.packages : [];

    const packagePrices = packages
        .map((pkg) => Number(pkg?.price))
        .filter((price) => Number.isFinite(price));
    const packageDeliveryDays = packages
        .map((pkg) => Number(pkg?.deliveryDays))
        .filter((days) => Number.isFinite(days) && days > 0);

    const fallbackPrice = packagePrices.length > 0 ? Math.min(...packagePrices) : 0;
    const fallbackDeliveryDays = packageDeliveryDays.length > 0 ? Math.min(...packageDeliveryDays) : null;

    const normalizedPrice = Number(service.price);
    const hasLegacyPrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0;

    return {
        ...service,
        price: hasLegacyPrice ? normalizedPrice : fallbackPrice,
        deliveryTime: service.deliveryTime || toDeliveryLabel(fallbackDeliveryDays),
        description: service.description || service.shortDescription || '',
    };
};

// @desc    Create a new service/gig
// @route   POST /api/services
// @access  Private (Student Sellers only)
const createService = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            category,
            tags,
            packages,
            addons,
            requirements,
            rushDeliveryAvailable,
            rushDeliveryPrice,
            rushDeliveryDays,
        } = req.body;

        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Parse JSON strings if they come as strings
        let parsedPackages = packages;
        let parsedAddons = addons;
        let parsedRequirements = requirements;
        let parsedTags = tags;

        if (typeof packages === 'string') {
            parsedPackages = JSON.parse(packages);
        }
        if (typeof addons === 'string') {
            parsedAddons = JSON.parse(addons);
        }
        if (typeof requirements === 'string') {
            parsedRequirements = JSON.parse(requirements);
        }
        if (typeof tags === 'string') {
            parsedTags = JSON.parse(tags);
        }

        // Validate packages
        if (!parsedPackages || parsedPackages.length === 0) {
            return res.status(400).json({ message: 'At least one pricing package is required' });
        }

        const packagePrices = (parsedPackages || [])
            .map((pkg) => Number(pkg?.price))
            .filter((price) => Number.isFinite(price));
        const packageDeliveryDays = (parsedPackages || [])
            .map((pkg) => Number(pkg?.deliveryDays))
            .filter((days) => Number.isFinite(days) && days > 0);

        const startingPrice = packagePrices.length > 0 ? Math.min(...packagePrices) : 0;
        const fastestDeliveryDays = packageDeliveryDays.length > 0 ? Math.min(...packageDeliveryDays) : 7;

        const service = await Service.create({
            title,
            description,
            shortDescription: shortDescription || '',
            category,
            // Keep legacy fields synced so old UI components still work.
            price: startingPrice,
            deliveryTime: toDeliveryLabel(fastestDeliveryDays),
            tags: parsedTags || [],
            packages: parsedPackages || [],
            addons: parsedAddons || [],
            requirements: parsedRequirements || [],
            rushDeliveryAvailable: rushDeliveryAvailable === 'true' || rushDeliveryAvailable === true,
            rushDeliveryPrice: rushDeliveryAvailable ? parseFloat(rushDeliveryPrice) || 0 : 0,
            rushDeliveryDays: rushDeliveryAvailable ? parseInt(rushDeliveryDays) || 1 : 1,
            coverImage: req.file ? `/uploads/${req.file.filename}` : '',
            seller: req.user._id,
            status: 'active',
        });

        console.log(`[DEBUG] Service created successfully for seller: ${req.user._id}`);
    res.status(201).json(normalizeService(service));
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
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

        res.json(activeServices.map(normalizeService));
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

        res.json(services.map(normalizeService));
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

        res.json(normalizeService(service));
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

        let {
            title,
            description,
            shortDescription,
            category,
            price,
            deliveryTime,
            tags,
            packages,
            addons,
            requirements,
            rushDeliveryAvailable,
            rushDeliveryPrice,
            rushDeliveryDays,
        } = req.body;

        if (typeof packages === 'string') {
            packages = JSON.parse(packages);
        }
        if (typeof addons === 'string') {
            addons = JSON.parse(addons);
        }
        if (typeof requirements === 'string') {
            requirements = JSON.parse(requirements);
        }
        if (typeof tags === 'string') {
            tags = JSON.parse(tags);
        }

        // only update fields that were provided
        if (title !== undefined) service.title = title;
        if (description !== undefined) service.description = description;
        if (shortDescription !== undefined) service.shortDescription = shortDescription;
        if (category !== undefined) service.category = category;
        if (price !== undefined) service.price = Number(price) || 0;
        if (deliveryTime !== undefined) service.deliveryTime = deliveryTime;
        if (tags !== undefined) service.tags = Array.isArray(tags) ? tags : [];
        if (addons !== undefined) service.addons = Array.isArray(addons) ? addons : [];
        if (requirements !== undefined) service.requirements = Array.isArray(requirements) ? requirements : [];

        if (packages !== undefined) {
            const normalizedPackages = Array.isArray(packages) ? packages : [];
            service.packages = normalizedPackages;

            const packagePrices = normalizedPackages
                .map((pkg) => Number(pkg?.price))
                .filter((value) => Number.isFinite(value) && value >= 0);
            const packageDeliveryDays = normalizedPackages
                .map((pkg) => Number(pkg?.deliveryDays))
                .filter((value) => Number.isFinite(value) && value > 0);

            if (packagePrices.length > 0) {
                service.price = Math.min(...packagePrices);
            }

            if (packageDeliveryDays.length > 0) {
                service.deliveryTime = toDeliveryLabel(Math.min(...packageDeliveryDays));
            }
        }

        if (rushDeliveryAvailable !== undefined) {
            service.rushDeliveryAvailable = rushDeliveryAvailable === true || rushDeliveryAvailable === 'true';
        }
        if (rushDeliveryPrice !== undefined) {
            service.rushDeliveryPrice = Number(rushDeliveryPrice) || 0;
        }
        if (rushDeliveryDays !== undefined) {
            service.rushDeliveryDays = Number(rushDeliveryDays) || 1;
        }

        // handle image file if uploaded
        if (req.file) {
            service.coverImage = `/uploads/${req.file.filename}`;
        }

        const updated = await service.save();
        res.json(normalizeService(updated));
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
