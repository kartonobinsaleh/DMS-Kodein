# Development Tasks (AI-Executable)


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

## Phase 7 - Business Logic Rules [DONE]

- Prevent double borrow [DONE]
- Prevent return without borrow [DONE]
- Auto mark overdue (based on time limit) [DONE]
- Log all activities [DONE]

---

## Phase 8 - Testing [DONE]

- Test borrow flow [DONE]
- Test return flow [DONE]
- Test invalid scenarios: [DONE]
  - borrow unavailable device [DONE]
  - return already returned device [DONE]

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
