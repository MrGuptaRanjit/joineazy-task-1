# REST API Specification

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
      "id": "c0000000-0000-0000-0000-000000000001",
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
- **Success (200 OK)**: Returns JWT token and user profile with group context.

### `GET /api/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Description**: Retrieves current user's profile and active group membership.

---

## 👥 2. Group Management Endpoints (`/api/groups`)

### `POST /api/groups`
- **Access**: Student
- **Description**: Creates a new group. Creator automatically becomes the leader.
- **Request Body**: `{ "name": "Team Nova" }`
- **Conflict (409)**: If the student is already in a group or group name exists.

### `GET /api/groups/my`
- **Access**: Student
- **Description**: Returns current student's group details and full member roster.

### `POST /api/groups/:id/members`
- **Access**: Student (Group Member)
- **Description**: Adds a peer student to the group via email or student ID.
- **Request Body**: `{ "identifier": "STU1005" }`

### `DELETE /api/groups/:id/members/:userId`
- **Access**: Student (Group Leader or Self)
- **Description**: Removes student from group.

---

## 📚 3. Assignment & Submission Endpoints

### `GET /api/assignments/my`
- **Access**: Student
- **Description**: Retrieves coursework visible to the student (targeted globally or to their active group).

### `POST /api/submissions`
- **Access**: Student
- **Description**: Confirms completion of an assignment using two-step verification.
- **Request Body**:
```json
{
  "assignment_id": "a0000000-0000-0000-0000-000000000001",
  "is_confirmed": true
}
```

---

## 👨‍🏫 4. Admin & Professor Endpoints (`/api/admin`)

*Note: All endpoints require an `ADMIN` role JWT. Students receive HTTP 403 Forbidden.*

### `GET /api/admin/assignments`
- **Access**: Admin
- **Description**: Returns all assignments with target types, due dates, submission counts, and completion rates.

### `POST /api/admin/assignments`
- **Access**: Admin
- **Description**: Creates assignment with title, description, due date, OneDrive URL, and target configuration (`ALL_STUDENTS` or `SPECIFIC_GROUPS` with `group_ids`).

### `GET /api/admin/assignments/:id`
- **Access**: Admin
- **Description**: Retrieves assignment details and target group IDs.

### `PUT /api/admin/assignments/:id`
- **Access**: Admin
- **Description**: Updates assignment details and targets.

### `DELETE /api/admin/assignments/:id`
- **Access**: Admin
- **Description**: Deletes assignment.

### `GET /api/admin/assignments/:id/submissions`
- **Access**: Admin
- **Description**: Audit matrix of all targeted students and confirmation status.

### `GET /api/admin/groups/:id/audit`
- **Access**: Admin
- **Description**: Deep group audit with member-by-member assignment confirmation tree.

### `GET /api/admin/analytics/overview`
- **Access**: Admin
- **Description**: Summary KPIs (Total students, groups, assignments, submissions, completion rate).

### `GET /api/admin/analytics/groups`
- **Access**: Admin
- **Description**: Group cohort performance comparison data.

### `GET /api/admin/analytics/students`
- **Access**: Admin
- **Description**: Per-student submission metrics and completion percentages.
