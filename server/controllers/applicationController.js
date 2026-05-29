const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');

const APPLICATION_STATUSES = ['Pending', 'Accepted', 'Rejected'];

const applicationPopulate = [
    {
        path: 'job',
        select: 'title category budget deliveryTime status buyer createdAt',
        populate: {
            path: 'buyer',
            select: 'name email profileImage',
        },
    },
    {
        path: 'seller',
        select: 'name email profileImage universityDomain',
    },
];

const createApplication = async (req, res) => {
    try {
        const { jobId, message, proposedPrice, deliveryTime } = req.body;
        const trimmedMessage = String(message || '').trim();
        const numericPrice = Number(proposedPrice);
        const numericDelivery = Number(deliveryTime);

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'A valid job id is required' });
        }
        if (!trimmedMessage) {
            return res.status(400).json({ message: 'Proposal message is required' });
        }
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: 'Proposed price must be a positive number' });
        }
        if (!Number.isFinite(numericDelivery) || numericDelivery <= 0) {
            return res.status(400).json({ message: 'Delivery time must be at least 1 day' });
        }

        const job = await Job.findById(jobId).populate('buyer', 'name email');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status !== 'Open') {
            return res.status(400).json({ message: 'Applications are only allowed for open jobs' });
        }

        if (String(job.buyer?._id) === String(req.user._id)) {
            return res.status(400).json({ message: 'You cannot apply to your own job post' });
        }

        const existingApplication = await Application.findOne({
            job: job._id,
            seller: req.user._id,
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        const application = await Application.create({
            job: job._id,
            seller: req.user._id,
            message: trimmedMessage,
            proposedPrice: numericPrice,
            deliveryTime: numericDelivery,
            status: 'Pending',
        });

        const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);

        return res.status(201).json({
            message: 'Application submitted successfully',
            application: populatedApplication,
            buyerNotification: `You received a new application for ${job.title}`,
        });
    } catch (error) {
        console.error('Create application error:', error);
        if (error?.code === 11000) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }
        return res.status(500).json({ message: 'Server error while creating application' });
    }
};

const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job id' });
        }

        const job = await Job.findById(jobId).select('buyer');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (String(job.buyer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only view applications for your own jobs' });
        }

        const applications = await Application.find({ job: jobId })
            .populate(applicationPopulate)
            .sort({ createdAt: -1 });

        return res.json(applications);
    } catch (error) {
        console.error('Get applications for job error:', error);
        return res.status(500).json({ message: 'Server error while fetching applications' });
    }
};

const getSellerApplications = async (req, res) => {
    try {
        const applications = await Application.find({ seller: req.user._id })
            .populate(applicationPopulate)
            .sort({ createdAt: -1 });

        return res.json(applications);
    } catch (error) {
        console.error('Get seller applications error:', error);
        return res.status(500).json({ message: 'Server error while fetching your applications' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        const status = String(req.body.status || '').trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid application id' });
        }

        if (!APPLICATION_STATUSES.includes(status) || status === 'Pending') {
            return res.status(400).json({ message: 'Application status must be Accepted or Rejected' });
        }

        session.startTransaction();

        const application = await Application.findById(id).session(session);
        if (!application) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Application not found' });
        }

        const job = await Job.findById(application.job).session(session);
        if (!job) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Job not found' });
        }

        if (String(job.buyer) !== String(req.user._id)) {
            await session.abortTransaction();
            return res.status(403).json({ message: 'You can only manage applications for your own jobs' });
        }

        if (status === 'Accepted') {
            application.status = 'Accepted';
            await application.save({ session });

            await Application.updateMany(
                {
                    job: job._id,
                    _id: { $ne: application._id },
                },
                { $set: { status: 'Rejected' } },
                { session }
            );

            job.status = 'In Progress';
            await job.save({ session });
        } else {
            application.status = 'Rejected';
            await application.save({ session });
        }

        await session.commitTransaction();

        const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
        return res.json({
            message: 'Application status updated successfully',
            application: populatedApplication,
        });
    } catch (error) {
        console.error('Update application status error:', error);
        await session.abortTransaction();
        return res.status(500).json({ message: 'Server error while updating application status' });
    } finally {
        session.endSession();
    }
};

module.exports = {
    createApplication,
    getApplicationsForJob,
    getSellerApplications,
    updateApplicationStatus,
};
