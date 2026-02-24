# 🎓 UniGig - The Verified Student Freelance Marketplace

## 📖 About the Project
UniGig is a secure, MERN-stack freelance marketplace designed specifically to empower university students. Our platform bridges the gap between student freelancers and the general public, providing a safe environment for students to earn money, build their professional portfolios, and gain real-world experience while studying.

**The Catch:** Buyers can be anyone, but **Sellers MUST be verified university students**. 

To ensure a trusted ecosystem free from scams, UniGig features an automated verification engine that strictly validates seller registrations against recognized university email domains (e.g., `.ac.lk`, `@my.sliit.lk`, `@students.nsbm.ac.lk`, `@kdu.ac.lk`). 

## ✨ Key Features

* **🛡️ Strict Student Verification:** Automated email domain checking ensures only legitimate students can create service listings. Personal emails (Gmail, Yahoo) are restricted to Buyer accounts only.
* **📦 Service Creation & Visual Discovery:** Students can easily post gigs with custom pricing, delivery times, and image galleries. The search grid uses a visual-first design to help buyers evaluate quality instantly.
* **⏸️ Availability Control:** A simple "Active/Away" toggle allows students to hide their services during busy exam weeks without losing their profile data.
* **⚙️ Strict Order Processing:** A structured workflow (Pending -> In Progress -> Delivered) ensures both buyers and sellers follow a safe, predictable path for every transaction.
* **💼 Professional Portfolios:** Sellers can build detailed profiles linking to their GitHub/LinkedIn and showcase past work through dedicated image and file uploads.
* **💬 Real-Time Chat & Dispute Resolution:** Integrated live messaging allows secure file sharing and communication. Reviews are strictly locked until an order is fully completed to prevent fake ratings.

## 🛠️ Technology Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Real-Time Communication:** Socket.io
* **Image Handling:** Multer

## 🚀 How to Run the Project Locally

1. **Clone the repository:**
   git clone [https://github.com/your-username/unigig.git](https://github.com/justtnikiyaa/ITPM-Project-3rd-Year-1st-sem.git)
   cd unigig

2. **Install Backend Dependencies:**
   cd server
   npm install

3. **Install Frontend Dependencies:**
   cd ../client
   npm install

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and add the following:
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key

5. **Start the Application:**
   Open two terminal windows.
   - Terminal 1 (Backend): cd server && npm run dev
   - Terminal 2 (Frontend): cd client && npm run dev

## 👥 Meet the Team
* **Member 1:** Authentication, Identity Verification, Service Creation & Visual Search
* **Member 2:** System Architecture & Order Processing Engine
* **Member 3:** Security, Database Management & User Portfolios
* **Member 4:** Real-Time Communication & Dispute Resolution Logic
