# 🧠 Technical Interview Preparation & Architecture Decisions (MERN Stack)

This document contains detailed engineering rationale and answers for the **Joineazy Student, Group & Assignment Management System** to assist during technical interviews and architecture reviews.

---

## 📌 1. Why React + Vite?
- **Component-Driven Architecture**: Modular UI with reusable components (`Button`, `Card`, `Modal`, `ProgressBar`, `ErrorAlert`, `EmptyState`).
- **Declarative State Management**: React Context (`AuthContext`, `ToastContext`) provides clean, un-bloated state management across route boundaries without heavy third-party state managers.
- **Fast Client Routing**: React Router v6 delivers instantaneous role-guarded page transitions without full browser reloads.
- **Lightning Build Performance**: Vite provides instant HMR and optimized Rollup production builds.

## 📌 2. Why Tailwind CSS?
- **Utility-First Speed & Consistency**: Enforces a strict design token system with cohesive palettes (`slate-950`, `brand-500`, `indigo-500`), spacing, and typography.
- **Minimal Bundle Footprint**: Tailwind purges unused CSS classes during production build (`vite build`), resulting in a tiny 34.79 kB CSS bundle.
- **Built-in Responsiveness**: Native responsive prefixes (`sm:`, `md:`, `lg:`) ensure all tables and dashboard views adapt to mobile screens.

## 📌 3. Why Node.js & Express?
- **Asynchronous Non-Blocking I/O**: Excellent concurrency handling for I/O-bound REST APIs querying MongoDB.
- **Clean Middleware Pipeline**: Streamlined lifecycle for CORS, JSON body parsing, JWT authentication, and centralized error handling.
- **Lightweight & Transparent**: Low runtime overhead without framework magic, making debugging straightforward.

## 📌 4. Why MongoDB & Mongoose?
- **Flexible Document Model with Strict Schemas**: Mongoose provides strict schema validation, type enforcement, and enum verification while maintaining JSON native format.
- **Relational Integrity via ObjectId References**: Uses `ref` relationships to model Users, Groups, Group Memberships, Assignments, and Submissions.
- **Database-Level Compound Unique Indexes**: Enforces single-group constraints (`GroupMember.user_id: 1` unique index) and duplicate submission prevention (`Submission` compound `{ assignment_id: 1, student_id: 1 }` unique index).
- **Free-Tier Cloud Availability**: Hosted seamlessly on MongoDB Atlas M0 free tier with zero infrastructure cost.

## 📌 5. Why JWT (JSON Web Tokens)?
- **Stateless Authentication**: Enables scalable API servers without requiring server-side session stores (like Redis) for session validation.
- **Cryptographic Security**: Signed with `HMAC SHA-256` secret key, encapsulating user identity (`id`) and role (`role`).

## 📌 6. How Authentication Works
1. Student registers or logs in via `/api/auth/register` or `/api/auth/login`.
2. Passwords are verified against the stored `bcrypt` hash (salt rounds = 10).
3. Backend issues a signed JWT containing user ID and role.
4. Frontend stores the JWT in `localStorage` and injects it into every outgoing Axios request header: `Authorization: Bearer <token>`.
5. `auth.middleware.js` verifies the token, finds the user in MongoDB, and populates `req.user`.

## 📌 7. How Role-Based Access Control (RBAC) Works
- Roles are strictly defined as `STUDENT` or `ADMIN`.
- Backend middleware `authorize('ADMIN')` enforces that only admin accounts can access administrative routes (`/api/admin/*`). Students receive **HTTP 403 Forbidden**.
- Frontend `ProtectedRoute` checks `allowedRoles` and redirects unauthorized users before page render.

## 📌 8. How Groups Are Modeled
- **Group Model**: Stores group metadata (`name`, `created_by`, `created_at`).
- **GroupMember Model**: Links `user_id` to `group_id` with a database-level `unique: true` index on `user_id`.
- This constraint guarantees that a student can belong to **at most one group** at any given time. When a student leaves, the membership document is removed, allowing them to join another group.

## 📌 9. How Assignment Targeting Works
- **`ALL`**: Coursework is visible to every registered student account.
- **`GROUPS`**: Target links are stored in `AssignmentTarget` records. When a student requests their coursework (`/api/assignments`), the service queries assignments targeted to `'ALL'` or matching the student's active `group_id`.

## 📌 10. How Submission Confirmation Works
- **Two-Step Verification**:
  1. *Step 1*: Student clicks "Yes, I have submitted", opening an explicit confirmation dialog.
  2. *Step 2*: Student checks the certification agreement and confirms.
- A record is upserted in `Submission` with `status = 'CONFIRMED'` and `confirmed_at = new Date()`.

## 📌 11. How Duplicate Submissions Are Prevented
- Enforced at the MongoDB level via compound unique index `{ assignment_id: 1, student_id: 1 }` on the `Submission` collection.
- Enforced at the frontend level by disabling the confirmation button, displaying a verified badge, and updating the assignment status to "Submitted".

## 📌 12. How Analytics Are Calculated
- Real-time MongoDB counts and aggregation pipelines calculate classroom completion rates, group performance, and status distributions without mock data.
- Division by zero is avoided through conditional rate calculation, preventing `NaN` or `Infinity`.

## 📌 13. How Database Relationships Work
- `User` (1) <---> (N) `Group` (`created_by`)
- `User` (1) <---> (0..1) `GroupMember` (`UNIQUE user_id`)
- `Group` (1) <---> (N) `GroupMember`
- `Assignment` (1) <---> (N) `AssignmentTarget`
- `Group` (1) <---> (N) `AssignmentTarget`
- `Assignment` (1) <---> (N) `Submission`
- `User` (1) <---> (N) `Submission`

## 📌 14. Why Controllers, Services & Repositories Are Separated
- **Controllers**: Thin HTTP request/response handlers, status code dispatching, and response formatting.
- **Services**: Pure business logic, workflow orchestration, authorization rule checks.
- **Repositories**: Mongoose queries, population, and aggregation pipelines.
- **Benefit**: High testability, separation of concerns, and clean maintainability.

## 📌 15. Why Docker & Docker Compose Are Used
- **Environment Parity**: Standardizes Node.js and MongoDB versions across all development machines.
- **One-Command Setup**: `docker compose up --build` spins up MongoDB, starts backend and frontend servers.

## 📌 16. Security Considerations
- Password hashing with `bcryptjs` (10 rounds).
- Password hash stripped from all repository queries and JSON responses (`select('-password_hash')`).
- Stateless signed JWT with expiration check.
- Role verification on both frontend routes and backend APIs.
- IDOR protections preventing unauthorized group member alterations or submission falsification.

## 📌 17. Important Engineering Tradeoffs
- **External OneDrive Folder vs Direct Binary Storage**: The task requested external OneDrive submission links with a two-step verification flow rather than hosting multi-gigabyte files locally.
- **In-Memory Test Adapter (`mongodb-memory-server`)**: Fast, isolated test suite execution without requiring an external MongoDB instance during unit/integration testing.

## 📌 18. Known Limitations
- Group creator transfer must be handled before the creator leaves the group.
- Real-time submission updates use request-response cycles rather than WebSockets.

## 📌 19. How the Application Could Scale
- **MongoDB Atlas Sharding & Indexes**: Compound indexing on queries with horizontal scaling.
- **Redis Caching**: Cache analytics overview and assignment targeting matrices with cache invalidation on submission confirmation.
- **Background Workers**: Queue email invitations and deadline reminders using BullMQ/RabbitMQ.
