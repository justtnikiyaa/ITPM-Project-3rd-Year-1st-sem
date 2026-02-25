const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const totalServices = await Service.countDocuments();
        console.log(`Total services in DB: ${totalServices}`);

        const services = await Service.find().populate('seller', 'name email');
        console.log('--- All Services ---');
        services.forEach(s => {
            console.log(`Title: ${s.title}`);
            console.log(`Seller ID: ${s.seller?._id}`);
            console.log(`Seller Name: ${s.seller?.name}`);
            console.log('---');
        });

        const users = await User.find({ isStudentSeller: true });
        console.log(`--- Student Sellers (${users.length}) ---`);
        users.forEach(u => {
            console.log(`Name: ${u.name}, ID: ${u._id}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
