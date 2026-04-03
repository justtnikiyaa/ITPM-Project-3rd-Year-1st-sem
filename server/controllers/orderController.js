const mongoose = require('mongoose');
const Order = require('../models/Order');
const Service = require('../models/Service');

const ORDER_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const toDeliveryLabel = (days) => {
    const numericDays = Number(days);
    if (!Number.isFinite(numericDays) || numericDays <= 0) {
        return '1 Week';
    }

    return `${numericDays} ${numericDays === 1 ? 'Day' : 'Days'}`;
};

const orderPopulate = [
    { path: 'buyer', select: 'name email' },
    { path: 'seller', select: 'name email universityDomain' },
    { path: 'service', select: 'title category coverImage seller status' },
];

const findSelectedPackage = (service, packageId, packageName) => {
    if (!Array.isArray(service.packages) || service.packages.length === 0) {
        return {
            _id: '',
            name: packageName || 'Standard',
            description: service.shortDescription || service.description || '',
            price: Number(service.price) || 0,
            deliveryDays: Number.parseInt(service.deliveryTime, 10) || 7,
        };
    }

    if (packageId) {
        const byId = service.packages.id(packageId);
        if (byId) return byId;
    }

    if (packageName) {
        return service.packages.find(
            (pkg) => String(pkg.name).toLowerCase() === String(packageName).trim().toLowerCase()
        );
    }

    return null;
};

const createOrder = async (req, res) => {
    try {
        const { serviceId, packageId, packageName, requirementsMessage } = req.body;
        const trimmedRequirements = String(requirementsMessage || '').trim();

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: 'A valid service id is required' });
        }

        if (!trimmedRequirements) {
            return res.status(400).json({ message: 'Order requirements are required' });
        }

        const service = await Service.findById(serviceId).populate('seller', 'name email availability');
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.status && service.status !== 'active') {
            return res.status(400).json({ message: 'This gig is not currently available for orders' });
        }

        if (!service.seller?._id) {
            return res.status(400).json({ message: 'Service seller could not be determined' });
        }

        if (String(service.seller._id) === String(req.user._id)) {
            return res.status(400).json({ message: 'You cannot place an order on your own gig' });
        }

        const selectedPackage = findSelectedPackage(service, packageId, packageName);
        if (!selectedPackage) {
            return res.status(400).json({ message: 'Please select a valid package' });
        }

        const order = await Order.create({
            buyer: req.user._id,
            seller: service.seller._id,
            service: service._id,
            titleSnapshot: service.title,
            descriptionSnapshot: service.description || service.shortDescription || '',
            packageId: selectedPackage._id ? String(selectedPackage._id) : '',
            packageName: selectedPackage.name,
            packageDescription: selectedPackage.description || '',
            price: Number(selectedPackage.price) || 0,
            deliveryDays: Number(selectedPackage.deliveryDays) || 1,
            deliveryTime: toDeliveryLabel(selectedPackage.deliveryDays),
            requirementsMessage: trimmedRequirements,
            orderDate: new Date(),
            status: 'Pending',
        });

        await Service.findByIdAndUpdate(service._id, { $inc: { totalOrders: 1 } });

        const populatedOrder = await Order.findById(order._id).populate(orderPopulate);

        return res.status(201).json({
            message: 'Order placed successfully',
            order: populatedOrder,
            sellerNotification: `You received a new order for ${service.title}`,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ message: 'Server error while creating order' });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user._id })
            .populate(orderPopulate)
            .sort({ createdAt: -1 });

        return res.json(orders);
    } catch (error) {
        console.error('Get seller orders error:', error);
        return res.status(500).json({ message: 'Server error while fetching incoming orders' });
    }
};

const getBuyerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate(orderPopulate)
            .sort({ createdAt: -1 });

        return res.json(orders);
    } catch (error) {
        console.error('Get buyer orders error:', error);
        return res.status(500).json({ message: 'Server error while fetching buyer orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }

        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (String(order.seller) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only update your own incoming orders' });
        }

        order.status = status;
        order.completedAt = status === 'Completed' ? new Date() : undefined;
        await order.save();

        const populatedOrder = await Order.findById(order._id).populate(orderPopulate);
        return res.json({
            message: 'Order status updated successfully',
            order: populatedOrder,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ message: 'Server error while updating order status' });
    }
};

module.exports = {
    ORDER_STATUSES,
    createOrder,
    getSellerOrders,
    getBuyerOrders,
    updateOrderStatus,
};
