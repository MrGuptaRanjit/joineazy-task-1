# 🎬 Technical Demo Video Script (5–8 Minutes)

This script provides a concise walkthrough for demonstrating the **Joineazy Student, Group & Assignment Management System**.

---

## ⏱️ Timeline & Outline

| Timecode | Segment | Core Action / Key Talking Points |
| :--- | :--- | :--- |
| **00:00 – 00:30** | **Project Introduction** | Overview of the full-stack role-based application for collaborative student cohorts, coursework targeting, and two-step submission auditing. |
| **00:30 – 01:30** | **Architecture & Tech Stack** | Layered React 18 + Tailwind CSS SPA, Node.js/Express REST backend, PostgreSQL 15 database, Docker multi-container setup, and JWT RBAC security. |
| **01:30 – 03:00** | **Student Workflow** | Student login (`alex@student.edu`), dashboard metrics, group collaboration hub, invitation by Student ID, coursework browsing, and the two-step submission confirmation. |
| **03:00 – 05:00** | **Admin / Professor Workflow** | Professor login (`admin@university.edu`), dashboard KPIs, assignment creation with group targeting (`ALL_STUDENTS` vs `SPECIFIC_GROUPS`), and OneDrive link integration. |
| **05:00 – 06:00** | **Submission Auditing & Analytics** | Deep assignment audit matrix, cohort-by-cohort submission tracking, Recharts interactive visual analytics, and individual student progress matrix. |
| **06:00 – 07:00** | **Security & Authorization** | Attempting admin routes with Student JWT (demonstrating HTTP 403 Forbidden), single-group constraint verification, and input validation. |
| **07:00 – 08:00** | **Architecture & Tradeoffs** | Clean architecture (Controllers -> Services -> Repositories), transactional consistency in PostgreSQL, and wrap-up. |

---

## 📝 Detailed Step-by-Step Script

### 1. Introduction (00:00 – 00:30)
> *"Hello, today I'm demonstrating the Student, Group & Assignment Management System built for Joineazy. This role-based full-stack web application enables students to collaborate in groups, access coursework materials and OneDrive links, verify their submissions with a two-step confirmation flow, and track team progress. It also provides professors with granular assignment targeting, submission audit matrices, and real-time executive analytics."*

### 2. Architecture & Tech Stack (00:30 – 01:30)
> *"The frontend is built with React 18 and Tailwind CSS for a modern, responsive user experience. The backend is built with Node.js and Express following a clean Controller-Service-Repository pattern. All data is persisted in PostgreSQL with strict foreign keys, unique constraints, and indexing. The entire stack is containerized with Docker and orchestrated using Docker Compose. Authentication is powered by stateless JWT tokens with role-based access control."*

### 3. Student Workflow (01:30 – 03:00)
1. **Login as Student**:
   - Navigate to `/login` and enter `alex@student.edu` / `Password123!`.
   - Show the Student Dashboard with live KPI cards: Current Group (*Cloud Architects Alpha*), Total Assigned, Completed, Pending, and Completion Rate (%).
2. **Group Collaboration Hub**:
   - Navigate to `/student/group`.
   - Show the group roster, leader badge, and demonstrate adding a student by Student ID (e.g. `STU1005`).
   - Mention the single-group constraint enforced in PostgreSQL preventing students from joining multiple groups simultaneously.
3. **Coursework & Two-Step Submission Confirmation**:
   - Navigate to `/student/assignments`.
   - Filter by *Pending* assignments. Click on **Assignment 1: Distributed Systems & Microservices Project**.
   - Click the external OneDrive folder button (opens in a secure new tab).
   - Click the primary action: **"Yes, I have submitted"**.
   - Show the confirmation dialog requiring the student to certify submission before executing the final confirmation.
   - Click **"Confirm Submission"**.
   - Show instant UI transition to *Submitted* with verified timestamp and progress bar update on `/student/progress`.

### 4. Admin / Professor Workflow (03:00 – 05:00)
1. **Login as Professor**:
   - Log out and log in as `admin@university.edu` / `Admin123!`.
   - Show the Executive Admin Dashboard with real PostgreSQL aggregate metrics.
2. **Create Targeted Assignment**:
   - Navigate to `/admin/assignments/new`.
   - Enter Title: *"Phase 2: Cloud Infrastructure Lab"*, Description, Due Date, and OneDrive URL.
   - Select **Target: Specific Groups** and select *Cloud Architects Alpha*.
   - Submit and show the assignment created successfully in `/admin/assignments`.

### 5. Submission Auditing & Analytics (05:00 – 06:00)
1. **Deep Assignment Audit**:
   - Click **View Audit** on an assignment.
   - Show the live matrix: Student Name, Student ID, Group Name, Submission Status (*Submitted* vs *Pending*), and Confirmed At timestamp.
2. **Group Monitoring**:
   - Navigate to `/admin/groups` and drill down into *Cloud Architects Alpha* (`/admin/groups/:id`).
   - Show member-by-member assignment completion breakdown tree.
3. **Executive Analytics**:
   - Navigate to `/admin/analytics`.
   - Show Recharts visualizations: Assignment Completion Rates Bar Chart, Group Performance Comparison Bar Chart, and Submission Distribution Doughnut Chart.
   - Show the individual student performance roster.

### 6. Security & Role Authorization (06:00 – 07:00)
1. **Role Protection**:
   - Open browser developer tools / console.
   - Demonstrate that sending a request to `/api/admin/analytics/overview` with a Student JWT returns **HTTP 403 Forbidden**.
   - Demonstrate that navigating directly to `/admin/*` as a student redirects to the student portal.
2. **Input Validation & Duplicate Prevention**:
   - Highlight that attempting duplicate confirmations or invalid input returns standardized error envelopes with appropriate HTTP status codes.

### 7. Wrap-up & Engineering Decisions (07:00 – 08:00)
> *"In summary, the system delivers high data integrity through database constraints, complete separation of concerns, and zero mock data. Thank you for watching."*
