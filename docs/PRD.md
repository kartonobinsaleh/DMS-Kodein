# 📄 Product Requirements Document (PRD)

## Device Management System (MVP)

---

## 1. Product Overview

**Product Name:** Device Management System (DMS)
**Type:** Internal School System (Web-Based, Mobile-First)

**Objective:**
To manage student device borrowing and returning in a structured, trackable, and controlled way to improve discipline, accountability, and device safety.

---

## 2. Problem Statement

- No clear tracking of device usage per student
- Delayed or missing returns
- Lack of accountability for damaged devices
- No real-time monitoring

**Solution:**
A centralized system to record, monitor, and control device usage per session.

---

## 3. Target Users

### Admin / Staff

- Manage borrowing & returning
- Monitor device usage
- Ensure compliance

### Students

- Borrow and return devices (through staff)

---

## 4. Goals (MVP)

- Record all borrowing activities
- Enforce one active device per student
- Provide real-time device status
- Reduce late returns

---

## 5. Success Metrics

- 100% transactions recorded
- 0 untracked devices
- <10% late returns
- Clear daily monitoring

---

## 6. MVP Scope

### 6.1 Device Management

- Create device
- View device list
- Status:
  - Available
  - In Use

---

### 6.2 Student Management

- Add student:
  - Name
  - Class

---

### 6.3 Borrowing Feature

**Flow:**

1. Select student
2. Select available device
3. Click “Borrow”

**System:**

- Save `borrow_time`
- Set device → In Use
- Create transaction → ACTIVE

---

### 6.4 Returning Feature

**Flow:**

1. Select active transaction
2. Confirm return
3. Optional: set condition

**System:**

- Save `return_time`
- Set device → Available
- Update transaction → COMPLETED

---

### 6.5 Dashboard

Display:

- Total devices
- Devices in use
- Available devices
- Active transactions

---

### 6.6 Transaction History

- Student name
- Device
- Borrow time
- Return time
- Status

---

## 7. Business Rules

- 1 student = max 1 active device
- Device must be Available to borrow
- All borrow must end with return
- No anonymous transactions

---

## 8. Authentication (MVP)

### Scope

- Admin login only
- Email + password

### Behavior

- All pages require authentication
- Unauthorized users redirected to login

---

## 9. User Flow

### Borrow

```
Select Student → Select Device → Borrow → Done
```

### Return

```
Select Transaction → Return → Done
```

---

## 10. Data Model

### User

- id
- name
- email
- password
- role

### Student

- id
- name
- class

### Device

- id
- name
- status

### Transaction

- id
- studentId
- deviceId
- borrowTime
- returnTime
- status
- condition

---

# 🧠 11. Technical Architecture (Based on Your Stack)

## 🧩 Stack

- **Framework:** Next.js (App Router, Fullstack)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **ORM:** Prisma
- **Authentication:** NextAuth
- **Validation:** Zod
- **Database:** PostgreSQL (recommended)

---

## 🏗️ Architecture Pattern

**Monorepo (Single Next.js App):**

- `/app` → UI + pages
- `/app/api` → API routes (backend)
- Prisma → DB layer
- NextAuth → auth layer

---

## 🔐 Authentication Flow (NextAuth)

- Credentials Provider (email/password)
- Session-based auth
- Middleware protection for routes

---

## 🧪 Validation (Zod)

Use Zod for:

- API request validation
- Form validation

Example:

- Borrow request schema
- Return request schema

---

## 🔄 State Management (Zustand)

Use Zustand for:

- UI state (modal, selected data)
- Lightweight global state

Avoid:

- Overusing it for server data (use fetch instead)

---

## 🗄️ Database Design (Prisma Insight)

Key relations:

- Student → Transactions (1:N)
- Device → Transactions (1:N)
- Transaction → belongs to both

---

## 12. UI/UX Requirements

- Mobile-first
- Fast interaction (≤ 3 steps)
- Minimal typing
- Clear status color

---

## 13. Out of Scope

- QR Code scanning
- Notifications
- Role-based access control (advanced)
- Parent integration
- Device health tracking

---

## 14. Future Enhancements

- QR-based system
- Late alerts
- Parent notification
- Analytics dashboard
- Multi-role system
