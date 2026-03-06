const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const Service = require('./server/models/Service');
const User = require('./server/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ isStudentSeller: true });
        console.log(`Found ${users.length} student sellers`);

        for (const user of users) {
            const services = await Service.find({ seller: user._id });
            console.log(`User: ${user.name} (${user.email}) - ID: ${user._id}`);
            console.log(`Gigs found by seller ID: ${services.length}`);

            if (services.length > 0) {
                services.forEach(s => {
                    console.log(`  - Title: ${s.title} (ID: ${s._id})`);
                });
            }

            // Also check with string ID just in case
            const servicesStr = await Service.find({ seller: user._id.toString() });
            console.log(`Gigs found by seller string ID: ${servicesStr.length}`);
        }

        const totalServices = await Service.countDocuments();
        console.log(`Total services in DB: ${totalServices}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
