# REST API Specification (MERN Stack)

All backend endpoints are prefixed with `/api` and return standardized JSON responses.

---

## 📦 Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Human-readable error explanation",
  "errors": null
}
```

---

## 🏥 Health Check (`GET /api/health`)
- **Access**: Public
- **Success (200 OK)**:
```json
{
  "success": true,
  "message": "Joineazy API is running",
  "database": "connected",
  "timestamp": "2026-09-17T10:00:00.000Z",
  "environment": "production"
}
```

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new student account. Role is strictly assigned as `STUDENT`.
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@student.edu",
  "password": "SecurePassword123!",
  "student_id": "STU9999"
}
```
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "65f0a1b2c3d4e5f6a7b8c901",
      "name": "Jane Doe",
      "email": "jane@student.edu",
      "role": "STUDENT",
      "student_id": "STU9999"
    }
  }
}
```

### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates user and returns JWT token.
- **Request Body**:
```json
{
  "email": "alex@student.edu",
  "password": "Password123!"
}
```
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "65f0a1b2c3d4e5f6a7b8c902",
      "name": "Alex Johnson",
      "email": "alex@student.edu",
      "role": "STUDENT",
      "student_id": "STU1001",
      "group": {
        "id": "65f0a1b2c3d4e5f6a7b8c910",
        "name": "Cloud Architects Alpha",
        "is_creator": true
      }
    }
  }
}
```

### `GET /api/auth/me`
- **Access**: Authenticated (`STUDENT` or `ADMIN`)
- **Headers**: `Authorization: Bearer <token>`
- **Success (200 OK)**: Current user profile with active group data.

---

## 👥 2. Group Management Endpoints (`/api/groups`)

### `POST /api/groups`
- **Access**: Authenticated `STUDENT`
- **Description**: Creates a new group and assigns the creator as first member. Student cannot already belong to a group.
- **Request Body**: `{ "name": "Quantum Computing Squad" }`

### `GET /api/groups/my`
- **Access**: Authenticated `STUDENT`
- **Description**: Returns current student's group, creator status, and member roster.

### `POST /api/groups/:id/members`
- **Access**: Authenticated Group Member
- **Description**: Invites/adds student by email or Student ID (`STUxxxx`). Candidate must not already belong to another group.
- **Request Body**: `{ "identifier": "STU1005" }`

### `DELETE /api/groups/:id/members/:userId`
- **Access**: Group Creator (any member) OR Self-removal (leaving group)
- **Description**: Removes member or allows student to leave group.

---

## 📚 3. Assignment Endpoints (`/api/assignments`)

### `GET /api/assignments`
- **Access**: Authenticated `STUDENT`
- **Description**: Returns assignments visible to student (`ALL` or targeted to student's group) with submission status (`CONFIRMED` / `PENDING`).

### `GET /api/assignments/:id`
- **Access**: Authenticated `STUDENT`
- **Description**: Returns single assignment details and student submission state.

### `POST /api/assignments/:id/submission/confirm`
- **Access**: Authenticated `STUDENT`
- **Description**: Two-step submission confirmation. Requires step-1 agreement.
- **Request Body**: `{ "is_confirmed": true }`

---

## 👨‍🏫 4. Admin Endpoints (`/api/admin`)
*(Protected by `authorize('ADMIN')` — returns 403 Forbidden to students)*

### `GET /api/admin/assignments`
- Lists all assignments, target types, and confirmed submission counts.

### `POST /api/admin/assignments`
- Creates new coursework assignment with `ALL` or `GROUPS` targeting.

### `PUT /api/admin/assignments/:id`
- Updates assignment title, description, due date, OneDrive link, or group targets.

### `DELETE /api/admin/assignments/:id`
- Deletes assignment, target records, and submission confirmations.

### `GET /api/admin/assignments/:id/submissions`
- Returns full submission audit matrix (group summary + individual student statuses).

### `GET /api/admin/groups` & `GET /api/admin/groups/:id`
- Cohort inspection and member-by-member assignment audit tree.

### `GET /api/admin/analytics/overview`
- Executive KPI cards data (Total Students, Groups, Assignments, Completed, Rate).

### `GET /api/admin/analytics/groups`
- Group-by-group performance distribution array.

### `GET /api/admin/analytics/students`
- Student-by-student completion matrix with calculated percentages.
