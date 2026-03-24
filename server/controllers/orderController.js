const mongoose = require('mongoose');
const Order = require('../models/Order');
const Service = require('../models/Service');

const createOrder = async (req, res) => {
    try {
        const { serviceId } = req.body;
        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: 'Valid serviceId is required' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        const order = await Order.create({
            buyer: req.user._id,
            seller: service.seller,
            service: service._id,
            titleSnapshot: service.title,
            descriptionSnapshot: service.description,
            status: 'Pending',
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const markOrderCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (String(order.seller) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Only seller can complete this order' });
        }

        order.status = 'Completed';
        order.completedAt = new Date();
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ buyer: req.user._id }, { seller: req.user._id }],
        })
            .populate('service', 'title category')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createOrder, markOrderCompleted, getMyOrders };
