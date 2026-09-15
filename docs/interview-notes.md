# 🧠 Technical Interview Preparation & Architecture Decisions

This document contains detailed engineering rationale and answers for the **Joineazy Student, Group & Assignment Management System** to assist during technical interviews and architecture reviews.

---

## 📌 1. Why React?
- **Component-Driven Architecture**: Modular UI with reusable components (`Button`, `Card`, `Modal`, `ProgressBar`, `ErrorAlert`, `EmptyState`).
- **Declarative State Management**: React Context (`AuthContext`, `ToastContext`) provides clean, un-bloated state management across route boundaries without heavy third-party state managers.
- **Fast Client Routing**: React Router v6 delivers instantaneous role-guarded page transitions without full browser reloads.

## 📌 2. Why Tailwind CSS?
- **Utility-First Speed & Consistency**: Enforces a strict design token system with cohesive palettes (`slate-950`, `brand-500`, `indigo-500`), spacing, and typography.
- **Minimal Bundle Footprint**: Tailwind purges unused CSS classes during production build (`vite build`), resulting in a tiny 34.79 kB CSS bundle.
- **Built-in Responsiveness**: Native responsive prefixes (`sm:`, `md:`, `lg:`) ensure all tables and dashboard views adapt to mobile screens.

## 📌 3. Why Node.js & Express?
- **Asynchronous Non-Blocking I/O**: Excellent concurrency handling for I/O-bound REST APIs querying PostgreSQL.
- **Clean Middleware Pipeline**: Streamlined lifecycle for CORS, JSON body parsing, JWT authentication, and centralized error handling.
- **Lightweight & Transparent**: Low runtime overhead without framework magic, making debugging straightforward.

## 📌 4. Why PostgreSQL?
- **Relational Data Integrity**: Relational constraints (`FOREIGN KEY ... ON DELETE CASCADE`, `UNIQUE`, `CHECK`) protect business rules at the database level.
- **Powerful Aggregations**: Enables calculation of classroom completion rates and cohort analytics directly inside PostgreSQL using `COUNT(DISTINCT ...)`, `CASE WHEN ...`, and `COALESCE(..., 0)`.
- **ACID Compliance**: Ensures atomic transactions when creating groups with initial membership and updating assignment targets.

## 📌 5. Why JWT (JSON Web Tokens)?
- **Stateless Authentication**: Enables scalable API servers without requiring server-side session stores (like Redis) for session validation.
- **Cryptographic Security**: Signed with `HMAC SHA-256` secret key, encapsulating user identity (`id`) and role (`role`).

## 📌 6. How Authentication Works
1. Student registers or logs in via `/api/auth/register` or `/api/auth/login`.
2. Passwords are verified against the stored `bcrypt` hash (salt rounds = 10).
3. Backend issues a signed JWT containing user ID and role.
4. Frontend stores the JWT in `localStorage` and injects it into every outgoing Axios request header: `Authorization: Bearer <token>`.
5. `auth.middleware.js` verifies the token and populates `req.user`.

## 📌 7. How Role-Based Access Control (RBAC) Works
- Roles are strictly defined as `STUDENT` or `ADMIN`.
- Backend middleware `authorize('ADMIN')` enforces that only admin accounts can access administrative routes (`/api/admin/*`). Students receive **HTTP 403 Forbidden**.
- Frontend `ProtectedRoute` checks `allowedRoles` and redirects unauthorized users before page render.

## 📌 8. How Groups Are Modeled
- **Groups Table**: Stores group metadata (`id`, `name`, `created_by`, `created_at`).
- **Group Members Table**: Links `user_id` to `group_id` with a database-level `UNIQUE(user_id)` constraint.
- This constraint guarantees that a student can belong to **at most one group** at any given time.

## 📌 9. How Assignment Targeting Works
- **`ALL_STUDENTS`**: Coursework is visible to every registered student account.
- **`SPECIFIC_GROUPS`**: Target links are stored in `assignment_targets`. When a student requests their coursework (`/api/assignments/my`), SQL joins `assignment_targets` with the student's active group membership in `group_members`. If the student is not in a targeted group, the assignment is excluded from the query result.

## 📌 10. How Submission Confirmation Works
- **Two-Step Verification**:
  1. *Step 1*: Student clicks "Yes, I have submitted", opening an explicit confirmation dialog.
  2. *Step 2*: Student checks the certification agreement and confirms.
- A record is created in `submissions` with `is_confirmed = TRUE` and `confirmed_at = NOW()`.

## 📌 11. How Duplicate Submissions Are Prevented
- Enforced at the PostgreSQL level via `UNIQUE(assignment_id, user_id)` on the `submissions` table.
- Enforced at the frontend level by disabling the confirmation button, displaying a verified badge, and updating the assignment status to "Submitted".

## 📌 12. How Analytics Are Calculated
- Real-time PostgreSQL aggregate queries:
  ```sql
  SELECT
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT u.id) as total_students,
    COUNT(DISTINCT g.id) as total_groups,
    COUNT(DISTINCT s.id) as completed_submissions,
    ROUND(
      (COUNT(DISTINCT s.id)::DECIMAL / NULLIF(COUNT(DISTINCT CASE ... END), 0)) * 100, 2
    ) as overall_completion_rate
  ```
- Division by zero is avoided using `NULLIF(..., 0)` and `COALESCE`, preventing `NaN` or `Infinity`.

## 📌 13. How Database Relationships Work
- `users` (1) <---> (N) `groups` (`created_by`)
- `users` (1) <---> (0..1) `group_members` (`UNIQUE user_id`)
- `groups` (1) <---> (N) `group_members` (`ON DELETE CASCADE`)
- `assignments` (1) <---> (N) `assignment_targets` (`ON DELETE CASCADE`)
- `groups` (1) <---> (N) `assignment_targets` (`ON DELETE CASCADE`)
- `assignments` (1) <---> (N) `submissions` (`ON DELETE CASCADE`)
- `users` (1) <---> (N) `submissions` (`ON DELETE CASCADE`)

## 📌 14. Why Controllers, Services & Repositories Are Separated
- **Controllers**: Thin HTTP request/response handlers, status code dispatching, and response formatting.
- **Services**: Pure business logic, workflow orchestration, authorization rule checks.
- **Repositories**: Direct SQL queries, parameterized statements, and database connection pooling.
- **Benefit**: High testability, separation of concerns, and clean maintainability.

## 📌 15. Why Docker & Docker Compose Are Used
- **Environment Parity**: Eliminates "it works on my machine" issues by standardizing Node.js and PostgreSQL versions across all machines.
- **One-Command Setup**: `docker compose up --build` spins up PostgreSQL, runs migrations, seeds demo data, and starts both backend and frontend servers.

## 📌 16. Security Considerations
- Parameterized SQL queries preventing SQL Injection.
- Password hashing with `bcrypt` (10 rounds).
- Password hash stripped from all repository queries and JSON responses.
- Stateless signed JWT with expiration check.
- Role verification on both frontend routes and backend APIs.
- IDOR protections preventing unauthorized group member alterations or submission falsification.

## 📌 17. Important Engineering Tradeoffs
- **External OneDrive Folder vs Direct Binary Storage**: The task requested external OneDrive submission links with a two-step verification flow rather than hosting multi-gigabyte files locally.
- **In-Memory Test Adapter (`pg-mem`)**: Fast, isolated test suite execution for continuous integration without requiring an external PostgreSQL instance during unit/integration testing.

## 📌 18. Known Limitations
- Group creator transfer must be handled before the creator leaves the group.
- Real-time submission updates use request-response cycles rather than WebSockets.

## 📌 19. How the Application Could Scale
- **Read Replicas**: Distribute read-heavy queries (dashboard views, analytics) to PostgreSQL read replicas.
- **Redis Caching**: Cache analytics overview and assignment targeting matrices with cache invalidation on submission confirmation.
- **Background Workers**: Queue email invitations and deadline reminders using BullMQ/RabbitMQ.
