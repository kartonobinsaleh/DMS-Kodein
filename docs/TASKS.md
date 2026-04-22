# Development Tasks (AI-Executable)

## Phase 0 - Project Initialization

- Initialize Next.js (App Router, TypeScript)
- Setup folder structure:
  - /app
  - /components
  - /lib
  - /store
  - /prisma
  - /types
- Setup environment variables (.env)

---

## Phase 1 - Core Setup

- Install dependencies:
  - tailwindcss
  - prisma
  - @prisma/client
  - zustand
  - next-auth
  - zod
  - react-hook-form

- Configure TailwindCSS
- Setup global styles
- Setup ESLint & Prettier

---

## Phase 2 - Database Setup

- Create Prisma schema:
  - User
  - Student
  - Device
  - BorrowLog

- Add enums:
  - Role (ADMIN, STAFF)
  - DeviceStatus (AVAILABLE, BORROWED, MAINTENANCE)

- Run migration
- Generate Prisma client

- Create seed script:
  - 1 admin user
  - sample students
  - sample devices

---

## Phase 3 - Authentication (NextAuth)

- Setup NextAuth (Credentials Provider)
- Implement login API
- Create login page UI

- Add role-based access:
  - ADMIN
  - STAFF

- Protect routes using middleware

---

## Phase 4 - Backend API (App Router)

Create API routes:

### Student

- GET /api/students
- POST /api/students

### Device

- GET /api/devices
- POST /api/devices
- PATCH /api/devices/:id

### Borrow

- POST /api/borrow
- Validate:
  - device available
  - student exists

### Return

- POST /api/return
- Update:
  - device status → AVAILABLE
  - borrow log → returnedAt

### Dashboard

- GET /api/dashboard
  - total devices
  - borrowed devices
  - overdue

- Add pagination & filtering where needed

- Validate all input using Zod

---

## Phase 5 - State Management (Zustand)

- Create global store:
  - authStore
  - deviceStore
  - borrowStore

- Handle:
  - loading state
  - error state

---

## Phase 6 - UI Implementation

### Pages

- Login Page
- Dashboard Page
- Devices Page
- Students Page
- Borrow Page
- Return Page

### Components

- Table (with pagination)
- Search bar
- Filter dropdown
- Status badge
- Modal form

### UX Rules

- Mobile-first design
- Simple & fast interaction (for school staff)
- Clear status indicators

---

## Phase 7 - Business Logic Rules

- Prevent double borrow
- Prevent return without borrow
- Auto mark overdue (based on time limit)
- Log all activities

---

## Phase 8 - Testing

- Test borrow flow
- Test return flow
- Test invalid scenarios:
  - borrow unavailable device
  - return already returned device

---

## Phase 9 - Deployment

- Setup Vercel
- Setup PostgreSQL (Supabase / Neon)
- Configure ENV variables
- Run production migration

---

## Phase 10 - Monitoring (Optional but Recommended)

- Add logging
- Add error tracking (Sentry)
- Add simple analytics
