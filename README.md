# ITUE301: Advanced Web Development Frameworks
## Practical Examination — SET C: Employee Leave Management System
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT  
**Course:** ITUE301: Advanced Web Development Frameworks  
**Student Roll No:** `24AIML062` | **Batch:** `C`  
**Tech Stack:** React (Vite) + Express.js + MongoDB with Mongoose  
**Repository Name:** `itue301-exam-24aiml062-C`

---

## 📖 Scenario Overview
**TechSolutions Pvt Ltd** manages leave requests over WhatsApp, leading to lost requests and unapproved leaves. This portal resolves the issue by allowing:
1. **Employees** to check leave balances and apply for leaves (`Casual`, `Sick`, `Earned`, `CompOff`).
2. **Employees** to view their leave status with real-time colored pill badges.
3. **Managers / HR** to review company-wide requests and approve or reject them.

---

## 🛠️ Project Structure
```
itue301-exam-24aiml062-C/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js     # User authentication & token issuance
│   │   ├── leaveRequestController.js # Leave application, history & approval logic
│   │   └── leaveTypeController.js    # Public leave-type retrieval
│   ├── middleware/
│   │   ├── authGuard.js          # JWT Bearer token authentication & role guard
│   │   ├── errorHandler.js       # Structured JSON error response handler
│   │   └── requestLogger.js      # Global [METHOD] [PATH] [TIMESTAMP] logger
│   ├── models/
│   │   ├── Employee.js           # Employee Mongoose schema with validations
│   │   ├── LeaveRequest.js       # LeaveRequest schema with refs & enums
│   │   └── LeaveType.js          # LeaveType schema with allowed types
│   ├── routes/
│   │   ├── authRoutes.js         # /api/v1/auth
│   │   ├── leaveRoutes.js        # /api/v1/leaves
│   │   └── leaveTypeRoutes.js    # /api/v1/leave-types
│   ├── scripts/
│   │   └── seed.js               # Database seeding script for test accounts & leave types
│   ├── .env.example              # Sample environment configuration
│   ├── package.json              # Backend scripts and dependencies
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeaveRequestCard.jsx # Reusable Card with colored pill badge (Task 1)
│   │   │   ├── Navbar.jsx           # React Router navigation links (Task 2)
│   │   │   └── ProtectedRoute.jsx   # Route guard & role verification
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state { employee, token, role }
│   │   ├── pages/
│   │   │   ├── ApplyLeavePage.jsx   # Dynamic leave application form (Task 2)
│   │   │   ├── HRPanel.jsx          # Lazy-loaded HR administration panel (Task 2 & 3)
│   │   │   ├── LoginPage.jsx        # Login page with demo autofill
│   │   │   └── MyLeavesPage.jsx     # API consumption, 3 states & filter (Task 4)
│   │   ├── App.jsx                  # React Router routes & Suspense wrapper
│   │   ├── index.css                # Clean, responsive styles
│   │   └── main.jsx                 # React root entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.x)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

---

### Step 1: Clone & Configure Environment
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Verify connection details:*
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/itue301_leave_management
   JWT_SECRET=cspit_itue301_exam_secret_key_2026
   JWT_EXPIRES_IN=7d
   ```

---

### Step 2: Install Backend & Seed Database
In `backend/` directory:
```bash
npm install
npm run seed
```
> **Note:** The seed script automatically inserts sample leave types (`Casual`, `Sick`, `Earned`, `CompOff`) and test user accounts with hashed passwords.

---

### Step 3: Run Backend Server
In `backend/` directory, start the server using either:
```bash
npm start
```
or
```bash
node server.js
```
The server will start at `http://localhost:5000` with routes at `http://localhost:5000/api/v1`.

---

### Step 4: Install & Run Frontend Client
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` (or the Vite URL shown) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Leave Balance |
| :--- | :--- | :--- | :--- |
| **Employee** | `john@techsolutions.com` | `password123` | 20 days |
| **HR Lead** | `hr@techsolutions.com` | `password123` | 25 days |
| **Manager** | `manager@techsolutions.com` | `password123` | 22 days |
| **Student** | `24aiml062@charusat.edu.in` | `password123` | 18 days |

*(Clickable one-click demo autofill buttons are also provided on the Login page).*

---

## 📡 REST API Endpoint Specifications (`/api/v1/`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates employee, returns JWT token and profile |
| `GET` | `/api/v1/leave-types` | Public | Returns all available leave types |
| `POST` | `/api/v1/leaves` | Protected (`authGuard`) | Validates balance, creates request, deducts balance |
| `GET` | `/api/v1/leaves/my` | Protected (`authGuard`) | Returns employee's own requests with `.populate()` |
| `GET` | `/api/v1/leaves` | Protected (`authGuard`, `hr`/`manager`) | Returns all requests across the organization |
| `PATCH`| `/api/v1/leaves/:id/status` | Protected (`authGuard`, `hr`/`manager`) | Approves/rejects request; validates `['approved', 'rejected']` |

---

## 🎯 Verification of Exam Tasks

### Task 1: React Component Architecture (4 Marks)
- `LeaveRequestCard.jsx` accepts 6 props: `fromDate`, `toDate`, `days`, `leaveType`, `reason`, `status`.
- Renders `status` as a colored pill badge:
  - Yellow for `pending` (`#FFC107`)
  - Green for `approved` (`#28A745`)
  - Red for `rejected` (`#DC3545`)
  - Grey for `cancelled` (`#6C757D`)
- Separated cleanly into reusable `/components` directory.

### Task 2: React Routing and State Management (4 Marks)
- Configured routes in `App.jsx`:
  - `/` -> `LoginPage`
  - `/apply` -> `ApplyLeavePage` (Protected)
  - `/my-leaves` -> `MyLeavesPage` (Protected)
  - `/hr` -> `HRPanel` (Lazy-loaded with `React.lazy` + `<Suspense>`, role `'hr'` required)
- `Navbar.jsx` with SPA client routing (`NavLink`) avoiding page reload.
- `ApplyLeavePage.jsx` uses `useState` to calculate duration dynamically from dates and handle form submission.
- `AuthContext.jsx` manages `{ employee, token, role }` and displays `"Welcome, [Name]"` on `MyLeavesPage`.

### Task 3: Express REST API + Middleware (4 Marks)
- `requestLogger.js` logs `[METHOD] [PATH] [TIMESTAMP]` globally for every request.
- `authGuard.js` extracts Bearer JWT token from `Authorization` header, returning 401 on failure.
- `PATCH /api/v1/leaves/:id/status` strictly accepts only `{ status: 'approved' | 'rejected' }`.
- `errorHandler.js` returns structured JSON error responses instead of raw stacks.

### Task 4: REST API Consumption in React (4 Marks)
- `MyLeavesPage.jsx` fetches `GET /api/v1/leaves/my` with `Authorization: Bearer <token>` in `useEffect`.
- Three states: `leaves`, `loading`, `error`.
- Displays loading spinner while fetching and `"Failed to load your leave history."` on error.
- Client-side status filter dropdown (`All | Pending | Approved | Rejected`) filters the cached array without making extra network requests.

### Task 5: MongoDB + Mongoose Schema Design & Validation (4 Marks)
- Three schemas created: `Employee`, `LeaveType`, and `LeaveRequest` with Mongoose references (`ref`).
- Validations implemented: required fields, unique email, enums (`Casual`, `Sick`, `Earned`, `CompOff`), min days 1, min leave balance 0.
- `POST /api/v1/leaves` checks `days <= employee.leaveBalance` (returning 400 with helpful JSON error message if exceeded) and deducts balance.
- `GET /api/v1/leaves/my` populates `leaveTypeId` with `name` and `maxDaysPerYear`.

---

## 🎓 Viva Voce Explanation Guide

1. **Why use Mongoose `.populate()`?**
   MongoDB is a document database. `.populate('leaveTypeId', 'name maxDaysPerYear')` performs a join-like operation in Mongoose, replacing the stored `ObjectId` with the actual `LeaveType` document fields.

2. **How does `authGuard` protect routes?**
   It inspects `req.headers.authorization`. If it starts with `Bearer `, it verifies the JWT using `jwt.verify(token, secret)`. If valid, it attaches `req.employee` to the request lifecycle; otherwise, it sends HTTP 401 Unauthorized.

3. **Why use `React.lazy` + `Suspense`?**
   Code-splitting: The `HRPanel` bundle is only downloaded by the client browser when an authorized HR user visits `/hr`, reducing the initial bundle size and speeding up page load times.

4. **How does client-side filtering work without API refetching?**
   `leaves` stores the complete dataset from the server. A derived variable `filteredLeaves = leaves.filter(...)` computes the visible subset on each render whenever `statusFilter` changes.
