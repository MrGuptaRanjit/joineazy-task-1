# Database Design & Mongoose Schema Architecture

The database for the **Student, Group & Assignment Management System** is powered by **MongoDB & Mongoose 8**. All schemas enforce strict validation, compound indexes, unique constraints, and ObjectId references to ensure complete relational data integrity.

---

## 🏛 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Group : "created_by"
    User ||--o| GroupMember : "user_id (UNIQUE)"
    Group ||--o{ GroupMember : "group_id"
    User ||--o{ Assignment : "created_by"
    Assignment ||--o{ AssignmentTarget : "assignment_id"
    Group ||--o{ AssignmentTarget : "group_id"
    User ||--o{ Submission : "student_id (UNIQUE with assignment_id)"
    Assignment ||--o{ Submission : "assignment_id"

    User {
        ObjectId _id PK
        String name
        String email UK
        String password_hash
        String role "STUDENT | ADMIN"
        String student_id "Sparse UK"
        Date created_at
        Date updated_at
    }

    Group {
        ObjectId _id PK
        String name UK
        ObjectId created_by FK
        Date created_at
        Date updated_at
    }

    GroupMember {
        ObjectId _id PK
        ObjectId group_id FK
        ObjectId user_id FK, UK
        Date joined_at
    }

    Assignment {
        ObjectId _id PK
        String title
        String description
        Date due_date
        String onedrive_link
        String target_type "ALL | GROUPS"
        ObjectId created_by FK
        Date created_at
        Date updated_at
    }

    AssignmentTarget {
        ObjectId _id PK
        ObjectId assignment_id FK
        ObjectId group_id FK
        Date created_at
    }

    Submission {
        ObjectId _id PK
        ObjectId assignment_id FK
        ObjectId student_id FK
        ObjectId group_id FK
        String status "CONFIRMED | PENDING"
        Date confirmed_at
    }
```

---

## 📋 Collection Specifications

### 1. `User` Collection (`users`)
- `_id`: `ObjectId` primary key
- `name`: `String`, required, max 255 chars
- `email`: `String`, required, unique, lowercase
- `password_hash`: `String`, required bcrypt hash
- `role`: `String`, enum `['STUDENT', 'ADMIN']`, default `'STUDENT'`
- `student_id`: `String`, uppercase, sparse unique index (required for students, null for admin)
- `created_at`, `updated_at`: `Date` timestamps

### 2. `Group` Collection (`groups`)
- `_id`: `ObjectId` primary key
- `name`: `String`, required, unique, min 3 max 150 chars
- `created_by`: `ObjectId` ref `'User'`
- `created_at`, `updated_at`: `Date` timestamps

### 3. `GroupMember` Collection (`groupmembers`)
- `_id`: `ObjectId` primary key
- `group_id`: `ObjectId` ref `'Group'`
- `user_id`: `ObjectId` ref `'User'`, **unique: true** (strictly enforces 1 group per student)
- `joined_at`: `Date` timestamp

### 4. `Assignment` Collection (`assignments`)
- `_id`: `ObjectId` primary key
- `title`: `String`, required, min 3 max 255 chars
- `description`: `String`, required
- `due_date`: `Date`, required
- `onedrive_link`: `String`, required valid URL
- `target_type`: `String`, enum `['ALL', 'GROUPS']`, default `'ALL'`
- `created_by`: `ObjectId` ref `'User'`
- `created_at`, `updated_at`: `Date` timestamps

### 5. `AssignmentTarget` Collection (`assignmenttargets`)
- `_id`: `ObjectId` primary key
- `assignment_id`: `ObjectId` ref `'Assignment'`
- `group_id`: `ObjectId` ref `'Group'`
- Compound unique index: `{ assignment_id: 1, group_id: 1 }`
- `created_at`: `Date` timestamp

### 6. `Submission` Collection (`submissions`)
- `_id`: `ObjectId` primary key
- `assignment_id`: `ObjectId` ref `'Assignment'`
- `student_id`: `ObjectId` ref `'User'`
- `group_id`: `ObjectId` ref `'Group'` (optional)
- `status`: `String`, enum `['CONFIRMED', 'PENDING']`, default `'CONFIRMED'`
- `confirmed_at`: `Date` timestamp
- Compound unique index: `{ assignment_id: 1, student_id: 1 }` (prevents duplicate confirmations)
