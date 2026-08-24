# ITUE301: Advanced Web Development Frameworks
## Practical Examination Report — SET C: Employee Leave Management System
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT  
**Course:** ITUE301: Advanced Web Development Frameworks  
**Student Roll No:** `24AIML062` | **Batch:** `C`  
**Tech Stack:** React (Vite) + Express.js + MongoDB with Mongoose  
**Repository Name:** `itue301-exam-24aiml062-C`  
**Latest Commit SHA:** `8cb025ab194aff3052ef0b4eb1c7c6fa4078ae87`  
**Report PDF Name:** `24aiml062_SetC_Report.pdf`

---

## 1. Project Scenario & Overview
**TechSolutions Pvt Ltd** manages employee leave requests over informal channels, leading to unrecorded leaves and delayed approvals. This portal resolves the problem by providing a centralized web application where:
- **Employees** can authenticate, inspect remaining leave balances, and apply for leaves (`Casual`, `Sick`, `Earned`, `CompOff`).
- **Employees** can view their leave history with dynamic colored status badges and filter requests on the client side.
- **HR and Managers** can access a protected administration panel to review and approve/reject leave requests.

---

## 2. Project Architecture & Folder Structure
```
itue301-exam-24aiml062-C/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js     # User authentication & token issuance
│   │   ├── leaveRequestController.js # Leave application, balance deduction & status update
│   │   └── leaveTypeController.js    # Public leave types listing
│   ├── middleware/
│   │   ├── authGuard.js          # JWT Bearer token verification & role authorization
│   │   ├── errorHandler.js       # Centralized structured JSON error handler
│   │   └── requestLogger.js      # Global [METHOD] [PATH] [TIMESTAMP] logger
│   ├── models/
│   │   ├── Employee.js           # Employee schema with email uniqueness & balance
│   │   ├── LeaveRequest.js       # LeaveRequest schema with Mongoose refs & status enum
│   │   └── LeaveType.js          # LeaveType schema with allowed leave types enum
│   ├── routes/
│   │   ├── authRoutes.js         # /api/v1/auth
│   │   ├── leaveRoutes.js        # /api/v1/leaves
│   │   └── leaveTypeRoutes.js    # /api/v1/leave-types
│   ├── scripts/
│   │   ├── seed.js               # Database seed script for initial data
│   │   └── test-api.js           # Automated verification test suite
│   ├── .env.example              # Sample backend environment configuration
│   ├── package.json              # Backend scripts and dependencies
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeaveRequestCard.jsx # Reusable Card with colored pill badges (Task 1)
│   │   │   ├── Navbar.jsx           # React Router navigation without page reload (Task 2)
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

## 3. Tasks Implementation & Coverage

### Task 1: React Component Architecture (4 Marks)
- Created the reusable `LeaveRequestCard` inside `/frontend/src/components/LeaveRequestCard.jsx`.
- Accepts 6 props: `fromDate`, `toDate`, `days`, `leaveType`, `reason`, `status`.
- Renders `status` as a colored pill badge:
  - **Pending:** Yellow (`#FFC107`)
  - **Approved:** Green (`#28A745`)
  - **Rejected:** Red (`#DC3545`)
  - **Cancelled:** Grey (`#6C757D`)

### Task 2: React Routing and State Management (4 Marks)
- Configured client-side routing in `App.jsx`:
  - `/` $\rightarrow$ `LoginPage`
  - `/apply` $\rightarrow$ `ApplyLeavePage` (Protected)
  - `/my-leaves` $\rightarrow$ `MyLeavesPage` (Protected)
  - `/hr` $\rightarrow$ `HRPanel` (Lazy-loaded with `React.lazy + Suspense`, requires role `'hr'`)
- Created `Navbar` with React Router `<NavLink>` components preventing full-page reloads.
- Built `ApplyLeavePage` with dynamic calculation of `computedDays` and form state management.
- Implemented `AuthContext` holding `{ employee, token, role }`, `login()`, and `logout()`.
- Displayed `"Welcome, [Name]"` at the top of `MyLeavesPage`.

### Task 3: Express REST API + Middleware (4 Marks)
- Implemented 5 REST endpoints under `/api/v1/`:
  - `POST /api/v1/auth/login`: Authenticates employee and issues JWT token.
  - `GET /api/v1/leave-types`: Returns public list of leave types.
  - `POST /api/v1/leaves`: Applies for leave and deducts leave balance.
  - `GET /api/v1/leaves/my`: Returns authenticated employee's requests.
  - `PATCH /api/v1/leaves/:id/status`: Manager/HR approves/rejects; strictly validates against `['approved', 'rejected']`.
- Custom `requestLogger` logs `[METHOD] [PATH] [TIMESTAMP]` globally for every request.
- Custom `authGuard` validates Bearer token and returns 401 on failure.
- Global `errorHandler` returns structured JSON error responses instead of raw stacks.

### Task 4: REST API Consumption in React (4 Marks)
- `MyLeavesPage` consumes `GET /api/v1/leaves/my` with Authorization header in `useEffect()`.
- Manages 3 states: `leaves`, `loading`, `error`.
- Displays loading spinner during fetch.
- Displays `"Failed to load your leave history."` on error / non-200 response.
- Renders leave records dynamically using `LeaveRequestCard`.
- Implemented client-side status filter dropdown (`All | Pending | Approved | Rejected`) that filters in-memory without extra network requests.

### Task 5: MongoDB + Mongoose Schema Design and Validation (4 Marks)
- Defined 3 Mongoose models:
  - `Employee`: `name`, `email` (unique, lowercase), `department`, `designation`, `role`, `leaveBalance` (min 0, default 20).
  - `LeaveType`: `name` (enum: `'Casual'`, `'Sick'`, `'Earned'`, `'CompOff'`), `maxDaysPerYear`.
  - `LeaveRequest`: `employeeId` (ref `Employee`), `leaveTypeId` (ref `LeaveType`), `fromDate`, `toDate`, `days` (min 1), `reason` (maxlength 500), `status` (enum, default `'pending'`).
- `POST /api/v1/leaves` validates `days <= employee.leaveBalance` (returns 400 if exceeded) and deducts balance.
- `GET /api/v1/leaves/my` populates `leaveTypeId` (`name`, `maxDaysPerYear`).

---

## 4. Setup and Run Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running on `mongodb://127.0.0.1:27017`

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run seed
npm start
```
*Backend runs on `http://localhost:5000` with API at `http://localhost:5000/api/v1`.*

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 5. Test Credentials

| Role | Email | Password | Leave Balance |
| :--- | :--- | :--- | :--- |
| **Employee** | `john@techsolutions.com` | `password123` | 20 days |
| **HR Lead** | `hr@techsolutions.com` | `password123` | 25 days |
| **Manager** | `manager@techsolutions.com` | `password123` | 22 days |
| **Candidate** | `24aiml062@charusat.edu.in` | `password123` | 18 days |

---

## 6. PDF Report Required Screenshots Checklist (`24aiml062_SetC_Report.pdf`)

1. **Screenshot 1 — MyLeavesPage:** Showing "Welcome, John Doe", leave balance, status filter, and `LeaveRequestCard` components with yellow, green, and red status pills.
2. **Screenshot 2 — Postman / API Client:** Showing `POST /api/v1/leaves` returning `201 Created` with created request object and deducted balance.
3. **Screenshot 3 — MongoDB Database:** Showing document in `leaverequests` collection with referenced `employeeId`, `leaveTypeId`, and status.
