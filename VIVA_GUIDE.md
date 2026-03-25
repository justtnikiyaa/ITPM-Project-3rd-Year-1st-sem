# VIVA QUICK REFERENCE - UniGig Project

## Your Part of the Project:
1. **Account Creation** (Buyer & Seller)
2. **Gig Service Creation**
3. **Seller Dashboard**
4. **Seller Active/Non-Active Status**
5. **Gig Details Page**
6. **Home Page**

---

## 🔍 WHERE TO FIND VALIDATIONS:

### 1️⃣ ACCOUNT CREATION (Buyer)
**Client-Side Validation:**
- File: `client/src/pages/BuyerRegister.jsx` (Lines 1-80)
  - ✅ Name required
  - ✅ Email type validation (browser checks email format)
  - ✅ Password minimum 6 characters

**Server-Side Validation:**
- File: `server/controllers/authController.js`
  - ✅ VALIDATION 1: Check all fields present (name, email, password) - Line ~27
  - ✅ VALIDATION 2: Check if email already exists - Line ~34
  - ✅ VALIDATION 3: Determine student seller from university email regex - Line ~38
  - ✅ Regex for university emails: Line ~7-9

**Database Schema:**
- File: `server/models/User.js`
  - ✅ Name: required, trimmed
  - ✅ Email: required, unique, lowercase
  - ✅ Password: required, minlength 6
  - ✅ Password hashing: Lines ~72-80 (pre-save middleware)

---

### 2️⃣ GIG SERVICE CREATION
**Client-Side Validation:**
- File: `client/src/components/CreateGigForm.jsx`
  - ✅ VALIDATION 1: Required fields check (title, description, category) - Line ~209
  - ✅ VALIDATION 2: All packages must have price & delivery days - Line ~214
  - Form submission: Line ~213-220

**Server-Side Validation:**
- File: `server/controllers/serviceController.js`
  - ✅ VALIDATION 1: Check required fields - Line ~57
  - ✅ VALIDATION 2: Parse JSON strings - Line ~61-73
  - ✅ VALIDATION 3: At least one package required - Line ~76
  - ✅ Package price and delivery day calculations - Line ~78-83

**Database Schema:**
- File: `server/models/Service.js`
  - ✅ Title: required, trimmed
  - ✅ Description: required, trimmed
  - ✅ Short Description: max 150 characters
  - ✅ Category: required
  - ✅ Packages: with enum for names ['Basic', 'Standard', 'Premium'], prices min 0, delivery min 1 day

---

### 3️⃣ SELLER DASHBOARD & STATUS TOGGLE
**Frontend Component:**
- File: `client/src/pages/SellerDashboard.jsx`
  - ✅ Redirect non-sellers: Line ~63-67
  - ✅ Toggle Availability Handler: Line ~124-137
  - ✅ Status Display (Active/Away): Line ~226-231

**Backend Toggle:**
- File: `server/controllers/userController.js`
  - ✅ Toggle Availability Endpoint - Line ~6-15
  - ✅ VALIDATION: Check if user exists
  - ✅ LOGIC: Toggle between 'Active' and 'Away'

**User Model - Status Field:**
- File: `server/models/User.js`
  - ✅ Availability: enum ['Active', 'Away'], default 'Active' - Line ~35-39

---

### 4️⃣ SELLER ACTIVE/NON-ACTIVE STATUS EFFECT
**How it works:**
1. Seller sets status in Dashboard (Active/Away)
2. Status updates in backend: `server/controllers/userController.js`
3. Home page filters services: `server/controllers/serviceController.js` Line ~110-114
4. Only services from 'Active' sellers are shown

**Key File:**
- File: `server/controllers/serviceController.js` - `getServices` function (Line ~105-114)
  - ✅ VALIDATION: Filter out services from 'Away' sellers before returning

---

### 5️⃣ GIG DETAILS PAGE
**Frontend:**
- File: `client/src/pages/ServiceDetails.jsx`
  - ✅ RETRIEVE SERVICE: Fetch by ID - Line ~36
  - ✅ VALIDATION: Check if service exists - Line ~56
  - ✅ RETRIEVE SELLER STATS: Get rating summary - Line ~38-40
  - ✅ Error handling if service not found - Line ~52-60

**Backend Endpoint:**
- File: `server/controllers/serviceController.js` - `getServiceById` function
  - ✅ VALIDATION: Check if service exists before returning
  - ✅ Populate seller information

---

### 6️⃣ HOME PAGE (Service Search & Display)
**Frontend:**
- File: `client/src/pages/Home.jsx`
  - ✅ VALIDATION: Search and category filtering - Line ~47-62
  - ✅ Fetch services with search/category - Line ~43-62
  - ✅ Handle category clicks - Line ~66-73

**Backend:**
- File: `server/controllers/serviceController.js` - `getServices` function (Line ~97-114)
  - ✅ VALIDATION: Search filter (title, description, category)
  - ✅ VALIDATION: Category filter
  - ✅ VALIDATION: Show only 'Active' seller services

---

## 📋 QUICK VALIDATION SUMMARY:

| Feature | Validation Type | Location |
|---------|-----------------|----------|
| Registration | Name, Email, Password | authController.js + BuyerRegister.jsx |
| Email Uniqueness | Database check | authController.js line 34 |
| Student Seller Detection | Regex check | authController.js line 7-9 |
| Gig Creation | Title, Description, Category, Packages | CreateGigForm.jsx + serviceController.js |
| Package Validation | Price & Delivery required | CreateGigForm.jsx line 214, serviceController.js line 76 |
| Seller Status | Active/Away toggle | userController.js |
| Service Filtering | Only 'Active' sellers | serviceController.js line 110-114 |
| Service Display | ID validation | ServiceDetails.jsx line 56 |

---

## 🚀 For Your Viva Answers:

**Q: How do you validate user registration?**
A: We have 2-layer validation:
- Client-side: HTML5 validation (type="email", minLength=6, required attributes)
- Server-side: Check all fields present, check email not duplicate, determine seller type from university email regex in authController.js

**Q: How do you handle seller active/inactive status?**
A: 
- Seller can toggle on Dashboard via handleToggleAvailability (SellerDashboard.jsx)
- Backend toggles between 'Active' and 'Away' in userController.js
- getServices in serviceController.js filters to show only Active seller services (line 110-114)
- This prevents 'Away' seller gigs from appearing on Home page

**Q: Where is gig validation done?**
A: 2-layer validation:
- Client: CreateGigForm.jsx validates title, description, category, package prices/delivery
- Server: serviceController.js performs same checks before saving to database

**Q: How is service/gig data retrieved?**
A: 
- Home page: Gets all services via getServices endpoint (filtered by seller status)
- Service Details: Gets specific service via getServiceById endpoint (serviceController.js)

---

## 🎯 Files You Modified:
✅ `server/models/User.js`
✅ `server/models/Service.js`
✅ `server/controllers/authController.js`
✅ `server/controllers/serviceController.js`
✅ `server/controllers/userController.js`
✅ `client/src/pages/BuyerRegister.jsx`
✅ `client/src/components/CreateGigForm.jsx`
✅ `client/src/pages/SellerDashboard.jsx`
✅ `client/src/pages/ServiceDetails.jsx`
✅ `client/src/pages/Home.jsx`

All validation comments are marked with ✅ for easy searching!
