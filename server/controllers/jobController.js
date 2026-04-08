const mongoose = require('mongoose');
const Job = require('../models/Job');

const JOB_STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];

const parseSkills = (skills) => {
    if (Array.isArray(skills)) {
        return skills.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof skills === 'string') {
        return skills
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeJobPayload = (body = {}) => {
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const category = String(body.category || '').trim();
    const requirements = String(body.requirements || '').trim();
    const budget = Number(body.budget);
    const deliveryTime = Number(body.deliveryTime);
    const skills = parseSkills(body.skills).slice(0, 12);

    return {
        title,
        description,
        category,
        requirements,
        budget,
        deliveryTime,
        skills,
    };
};

const validateJobPayload = ({ title, description, category, budget, deliveryTime }) => {
    if (!title) return 'Job title is required';
    if (!description) return 'Job description is required';
    if (!category) return 'Category is required';
    if (!Number.isFinite(budget) || budget <= 0) return 'Budget must be a positive number';
    if (!Number.isFinite(deliveryTime) || deliveryTime <= 0) return 'Delivery time must be at least 1 day';
    return '';
};

const createJob = async (req, res) => {
    try {
        const payload = normalizeJobPayload(req.body);
        const validationError = validateJobPayload(payload);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const job = await Job.create({
            buyer: req.user._id,
            ...payload,
            status: 'Open',
        });

        const populatedJob = await Job.findById(job._id).populate('buyer', 'name email profileImage');

        return res.status(201).json({
            message: 'Job posted successfully',
            job: populatedJob,
        });
    } catch (error) {
        console.error('Create job error:', error);
        return res.status(500).json({ message: 'Server error while creating job' });
    }
};

const getOpenJobs = async (req, res) => {
    try {
        const category = String(req.query.category || '').trim();
        const query = { status: 'Open' };

        if (category) {
            query.category = category;
        }

        const jobs = await Job.find(query)
            .populate('buyer', 'name email profileImage')
            .sort({ createdAt: -1 });

        return res.json(jobs);
    } catch (error) {
        console.error('Get open jobs error:', error);
        return res.status(500).json({ message: 'Server error while fetching jobs' });
    }
};

const getBuyerJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ buyer: req.user._id })
            .populate('buyer', 'name email profileImage')
            .sort({ createdAt: -1 });

        return res.json(jobs);
    } catch (error) {
        console.error('Get buyer jobs error:', error);
        return res.status(500).json({ message: 'Server error while fetching your jobs' });
    }
};

const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = String(req.body.status || '').trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid job id' });
        }

        if (!JOB_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid job status' });
        }

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (String(job.buyer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only update your own jobs' });
        }

        job.status = status;
        await job.save();

        const populatedJob = await Job.findById(job._id).populate('buyer', 'name email profileImage');

        return res.json({
            message: 'Job status updated successfully',
            job: populatedJob,
        });
    } catch (error) {
        console.error('Update job status error:', error);
        return res.status(500).json({ message: 'Server error while updating job status' });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid job id' });
        }

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (String(job.buyer) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only delete your own jobs' });
        }

        await job.deleteOne();

        return res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        return res.status(500).json({ message: 'Server error while deleting job' });
    }
};

module.exports = {
    createJob,
    getOpenJobs,
    getBuyerJobs,
    updateJobStatus,
    deleteJob,
};
