# System Design - Device Management System (MVP)

## Architecture

This system uses a fullstack Next.js architecture:

- Frontend (React - App Router)
- Backend (API Routes)
- Database (PostgreSQL via Prisma)
- Authentication (NextAuth)

---

## High-Level Flow

Client → API Route → Prisma → Database → Response → Client

---

## Layers

### 1. UI Layer

- Pages and components
- Forms (Borrow, Return, Dashboard)

### 2. API Layer (/app/api)

- Handles requests
- Validates input (Zod)
- Calls database via Prisma

### 3. Database Layer

- Managed by Prisma ORM
- PostgreSQL

---

## Key Modules

- Auth Module (NextAuth)
- Device Module
- Student Module
- Transaction Module

---

## State Management

- Zustand (for UI state only)
- Server state fetched via API

---

## Security

- All routes protected via authentication
- API requires session validation

---

## Deployment

- Frontend & Backend: Vercel
- Database: Supabase / PostgreSQL
