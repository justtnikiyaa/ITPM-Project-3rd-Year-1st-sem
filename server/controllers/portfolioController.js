const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Service = require('../models/Service');

const parseSkills = (skills) => {
    if (Array.isArray(skills)) return skills.map((item) => String(item).trim()).filter(Boolean);
    if (typeof skills === 'string') return skills.split(',').map((item) => item.trim()).filter(Boolean);
    return [];
};

const normalizeUrl = (value) => String(value || '').trim();

const isValidHttpUrl = (value) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value);

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const isStrongPassword = (password) => {
    if (typeof password !== 'string') return false;
    // Minimum 8 chars with upper/lowercase letters, number, and symbol.
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
};

const updateOwnProfile = async (req, res) => {
    try {
        const {
            name,
            bio,
            skills,
            portfolioSummary,
            availability,
            budgetPreference,
            workExperience,
            educationCertifications,
            linkedinUrl,
            githubUrl,
            portfolioWebsite,
        } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name !== undefined) {
            const parsedName = String(name).trim();
            if (!parsedName) return res.status(400).json({ message: 'Name cannot be empty' });
            user.name = parsedName;
        }
        if (bio !== undefined) user.bio = String(bio).trim().slice(0, 500);
        if (req.file) user.profileImage = `/uploads/${req.file.filename}`;
        if (skills !== undefined) user.skills = parseSkills(skills).slice(0, 20);
        if (!user.isStudentSeller && budgetPreference !== undefined) {
            user.budgetPreference = String(budgetPreference).trim().slice(0, 120);
        }

        // Portfolio summary and availability are seller-specific fields
        if (user.isStudentSeller && portfolioSummary !== undefined) {
            user.portfolioSummary = String(portfolioSummary).trim().slice(0, 300);
        }
        if (user.isStudentSeller && workExperience !== undefined) {
            const parsedWork = String(workExperience).trim();
            if (parsedWork && parsedWork.length < 10) {
                return res.status(400).json({ message: 'Work experience/history must be at least 10 characters' });
            }
            user.workExperience = parsedWork.slice(0, 1000);
        }
        if (user.isStudentSeller && educationCertifications !== undefined) {
            const parsedEducation = String(educationCertifications).trim();
            if (parsedEducation && parsedEducation.length < 10) {
                return res.status(400).json({ message: 'Education & certifications must be at least 10 characters' });
            }
            user.educationCertifications = parsedEducation.slice(0, 1000);
        }
        if (user.isStudentSeller && linkedinUrl !== undefined) {
            const parsedLinkedIn = normalizeUrl(linkedinUrl).slice(0, 300);
            if (parsedLinkedIn && (!isValidHttpUrl(parsedLinkedIn) || !parsedLinkedIn.toLowerCase().includes('linkedin.com'))) {
                return res.status(400).json({ message: 'Please provide a valid LinkedIn URL' });
            }
            user.linkedinUrl = parsedLinkedIn;
        }
        if (user.isStudentSeller && githubUrl !== undefined) {
            const parsedGithub = normalizeUrl(githubUrl).slice(0, 300);
            if (parsedGithub && (!isValidHttpUrl(parsedGithub) || !parsedGithub.toLowerCase().includes('github.com'))) {
                return res.status(400).json({ message: 'Please provide a valid GitHub URL' });
            }
            user.githubUrl = parsedGithub;
        }
        if (user.isStudentSeller && portfolioWebsite !== undefined) {
            const parsedWebsite = normalizeUrl(portfolioWebsite).slice(0, 300);
            if (parsedWebsite && !isValidHttpUrl(parsedWebsite)) {
                return res.status(400).json({ message: 'Portfolio website must be a valid URL' });
            }
            user.portfolioWebsite = parsedWebsite;
        }
        if (user.isStudentSeller && availability !== undefined) {
            if (!['Active', 'Away'].includes(availability)) {
                return res.status(400).json({ message: 'Availability must be Active or Away' });
            }
            user.availability = availability;
        }

        await user.save();
        const sanitized = await User.findById(user._id).select('-password -otp -otpExpires');
        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getBuyerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isStudentSeller) {
            return res.status(400).json({ message: 'This dashboard is only for buyers' });
        }

        const orders = await Order.find({ buyer: req.user._id })
            .populate('service', 'title category price')
            .populate('seller', 'name profileImage email')
            .sort({ createdAt: -1 });

        const postedJobs = orders.map((order) => ({
            id: order._id,
            title: order.titleSnapshot || order.service?.title || 'Job request',
            category: order.service?.category || 'General',
            status: order.status,
            createdAt: order.createdAt,
            orderDate: order.orderDate || order.createdAt,
            packageName: order.packageName || 'Standard',
            price: Number(order.price || order.service?.price || 0),
            deliveryTime: order.deliveryTime || '1 Week',
            requirementsMessage: order.requirementsMessage || '',
            deliveryNote: order.deliveryNote || '',
            deliveredImage: order.deliveredImage || '',
            deliveredAt: order.deliveredAt || null,
        }));

        const hiredFreelancersMap = new Map();
        for (const order of orders) {
            if (!order.seller) continue;
            const key = String(order.seller._id);
            if (!hiredFreelancersMap.has(key)) {
                hiredFreelancersMap.set(key, {
                    id: order.seller._id,
                    name: order.seller.name,
                    email: order.seller.email,
                    profileImage: order.seller.profileImage || '',
                    collaborations: 1,
                    lastWorkedAt: order.updatedAt || order.createdAt,
                });
            } else {
                const existing = hiredFreelancersMap.get(key);
                existing.collaborations += 1;
                existing.lastWorkedAt = order.updatedAt || order.createdAt;
                hiredFreelancersMap.set(key, existing);
            }
        }

        const statusCounts = {
            active: postedJobs.filter((job) => ['In Progress', 'Delivered'].includes(job.status)).length,
            pending: postedJobs.filter((job) => ['Pending'].includes(job.status)).length,
            completed: postedJobs.filter((job) => ['Completed'].includes(job.status)).length,
        };

        const notifications = [];
        if (statusCounts.pending > 0) {
            notifications.push({
                type: 'applications',
                message: `${statusCounts.pending} job request(s) are pending freelancer action.`,
            });
        }
        if (statusCounts.active > 0) {
            notifications.push({
                type: 'messages',
                message: `${statusCounts.active} collaboration(s) are currently in progress.`,
            });
        }
        if (postedJobs.some((job) => job.status === 'Delivered')) {
            notifications.push({
                type: 'delivery',
                message: 'A freelancer has delivered work and is waiting for your confirmation.',
            });
        }
        if (statusCounts.completed > 0) {
            notifications.push({
                type: 'completed',
                message: `${statusCounts.completed} project(s) completed successfully.`,
            });
        }

        // Placeholder for future freelancer->buyer review model
        const buyerReviews = [];

        res.json({
            buyer: user,
            postedJobs,
            postedJobStats: statusCounts,
            hiredFreelancers: Array.from(hiredFreelancersMap.values()),
            reviewsAboutBuyer: buyerReviews,
            notifications,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getSellerEarnings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('isStudentSeller');
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.isStudentSeller) {
            return res.status(403).json({ message: 'Only sellers can access earnings dashboard' });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const orders = await Order.find({ seller: req.user._id })
            .select('status price completedAt createdAt')
            .lean();

        const totalEarnings = orders
            .filter((order) => order.status === 'Completed')
            .reduce((sum, order) => sum + Number(order.price || 0), 0);

        const monthlyEarnings = orders
            .filter(
                (order) =>
                    order.status === 'Completed' &&
                    new Date(order.completedAt || order.createdAt) >= startOfMonth
            )
            .reduce((sum, order) => sum + Number(order.price || 0), 0);

        const pendingPayments = orders
            .filter((order) => ['Pending', 'In Progress', 'Delivered'].includes(order.status))
            .reduce((sum, order) => sum + Number(order.price || 0), 0);

        res.json({
            totalEarnings,
            monthlyEarnings,
            pendingPayments,
            currency: 'LKR',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOwnPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All password fields are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password must match' });
        }
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordMatches = await user.comparePassword(currentPassword);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteOwnProfile = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordMatches = await user.comparePassword(password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Password is incorrect' });
        }

        await Promise.all([
            Service.deleteMany({ seller: user._id }),
            Order.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] }),
            Review.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] }),
        ]);

        await user.deleteOne();
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getCompletedProjectsForSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller id' });
        }

        const orders = await Order.find({ seller: sellerId, status: 'Completed' })
            .populate('service', 'title category description coverImage')
            .sort({ completedAt: -1, updatedAt: -1 });

        const projects = orders.map((order) => ({
            orderId: order._id,
            projectTitle: order.titleSnapshot || order.service?.title || 'Completed project',
            category: order.service?.category || 'General',
            description: order.descriptionSnapshot || order.service?.description || '',
            completionDate: order.completedAt || order.updatedAt,
            relatedService: order.service
                ? {
                      id: order.service._id,
                      title: order.service.title,
                      category: order.service.category,
                  }
                : null,
            image: order.deliveredImage || order.service?.coverImage || '',
        }));

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getRatingSummary = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller id' });
        }

        const [summary] = await Review.aggregate([
            { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
            {
                $group: {
                    _id: '$seller',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const totalCompletedProjects = await Order.countDocuments({ seller: sellerId, status: 'Completed' });

        res.json({
            averageRating: summary ? Number(summary.averageRating.toFixed(2)) : 0,
            totalRatings: summary ? summary.totalReviews : 0,
            totalReviews: summary ? summary.totalReviews : 0,
            totalCompletedProjects,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getSellerPortfolio = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller id' });
        }

        const user = await User.findById(sellerId).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ message: 'Seller not found' });

        const completedProjects = await Order.countDocuments({ seller: sellerId, status: 'Completed' });
        const totalReviews = await Review.countDocuments({ seller: sellerId });
        const [aggregate] = await Review.aggregate([
            { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
            { $group: { _id: '$seller', averageRating: { $avg: '$rating' } } },
        ]);

        res.json({
            seller: user,
            stats: {
                averageRating: aggregate ? Number(aggregate.averageRating.toFixed(2)) : 0,
                totalCompletedProjects: completedProjects,
                totalReviews,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUserProfile,
    updateOwnProfile,
    updateOwnPassword,
    getSellerPortfolio,
    getCompletedProjectsForSeller,
    getRatingSummary,
    getBuyerDashboard,
    getSellerEarnings,
    deleteOwnProfile,
};
