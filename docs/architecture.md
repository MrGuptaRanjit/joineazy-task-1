# System Architecture (MERN Stack)

The **Joineazy Student, Group & Assignment Management System** is structured as a layered, role-based **MERN Stack** (MongoDB, Express.js, React + Vite, Node.js) architecture adhering to separation of concerns, strict boundary verification, and database-enforced integrity.

---

## 🏛 High-Level Architecture Overview

```mermaid
graph TD
    Client[React 18 SPA + Tailwind CSS]
    Router[React Router v6 Protected Routes]
    ServiceLayer[Axios API Client Layer]
    Express[Node.js / Express Server]
    AuthGuard[JWT Auth & RBAC Middleware]
    Validator[Express-Validator Middleware]
    Controller[HTTP Controllers]
    Service[Domain Services / Business Logic]
    Repository[Mongoose Data Access Repositories]
    MongoDB[(MongoDB Atlas / Mongoose 8)]

    Client --> Router
    Router --> ServiceLayer
    ServiceLayer -->|REST / JSON| Express
    Express --> AuthGuard
    AuthGuard --> Validator
    Validator --> Controller
    Controller --> Service
    Service --> Repository
    Repository -->|Mongoose Connection Pool| MongoDB
```

---

## 🔒 Security & Authorization Architecture

### 1. Stateless Authentication
- User login generates a cryptographically signed **JSON Web Token (JWT)** using `HMAC SHA-256`.
- Payloads contain `id` and `role` (`STUDENT` or `ADMIN`).
- Client stores the token in `localStorage` and attaches it via HTTP `Authorization: Bearer <token>` header through an Axios request interceptor.

### 2. Role-Based Access Control (RBAC)
- **Authentication Middleware (`auth.middleware.js`)**: Verifies token presence, checks expiration, decrypts claims, and injects `req.user`.
- **Authorization Guard (`authorize('ADMIN')`)**: Restricts executive admin endpoints. Students attempting access immediately receive **HTTP 403 Forbidden**.
- **Frontend Role Routing (`ProtectedRoute.jsx`)**: Enforces client-side routing bounds to prevent unauthorized screen flashing while relying on backend status codes as the authoritative source of truth.

### 3. IDOR & Resource Ownership Protections
- **Group Modification**: Only active members of a group can invite new peers.
- **Group Removal**: Only the group creator can remove other members; individual members can only remove themselves (leave).
- **Submissions**: Submissions are tied to the authenticated user ID (`req.user.id`). Students can only confirm assignments explicitly visible to them.

---

## 📁 Layer Responsibilities

| Layer | Responsibility | File Path Reference |
| :--- | :--- | :--- |
| **Presentation (UI)** | Responsive components, visual state machines, interactive Recharts. | `frontend/src/pages/`, `frontend/src/components/` |
| **Client Services** | Centralized Axios HTTP abstractions, token management, error unwrap. | `frontend/src/services/` |
| **Routing & Middleware** | HTTP route mapping, CORS, JWT extraction, validation interceptors. | `backend/src/routes/`, `backend/src/middleware/` |
| **Controllers** | Request unpacking, HTTP status code management, response formatting. | `backend/src/controllers/` |
| **Domain Services** | Business logic, permissions, workflow orchestration. | `backend/src/services/` |
| **Data Repositories** | Mongoose schema queries, compound indexing, aggregation pipelines. | `backend/src/repositories/` |
| **Database** | Document persistence, schema validation, unique indexes. | `MongoDB Atlas` |
