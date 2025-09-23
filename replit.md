# Procurement & Inventory Management System

## Overview

A comprehensive procurement and inventory management system built with React, TypeScript, and Express.js. The application facilitates cross-departmental inventory sharing through borrow requests and streamlines the procurement process through purchase requisitions. It includes vendor management, approval workflows, and audit trails with role-based access controls for different user types including general users, heads of departments (HOD), procurement managers, and finance officers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **Routing**: Wouter for client-side routing with protected routes
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based authentication with protected routes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Password Security**: Node.js crypto module with scrypt hashing
- **Session Management**: Express sessions with PostgreSQL session store

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with Drizzle Kit for schema management
- **Schema Structure**:
  - Users with role-based permissions (GENERAL_USER, HOD, PROCUREMENT_MANAGER, FINANCE_OFFICER)
  - Departments with HOD relationships
  - Items and inventory stock tracking
  - Borrow requests with dual approval workflow (requester HOD + owner HOD)
  - Purchase requisitions with three-tier approval (HOD → Procurement → Finance)
  - Vendor management with performance tracking
  - Audit logs for compliance and tracking
  - Stock movements for inventory history

### Approval Workflow System
- **Borrow Requests**: Dual approval system requiring both requester's HOD and owning department's HOD approval
- **Purchase Requisitions**: Three-tier approval workflow (Department HOD → Procurement Manager → Finance Officer)
- **Status Tracking**: Real-time status updates with PENDING/APPROVED/REJECTED states
- **Role-based Permissions**: Different interfaces and capabilities based on user roles

### API Architecture
- **RESTful Design**: Standard REST endpoints for all resources
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Comprehensive API request logging with response capture
- **Data Validation**: Zod schemas for request validation shared between client and server

### Security Implementation
- **Authentication**: Session-based authentication with secure password hashing
- **Authorization**: Role-based access control with protected routes
- **Session Security**: Secure session configuration with PostgreSQL session store
- **Input Validation**: Server-side validation using shared Zod schemas

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Connection Pooling**: @neondatabase/serverless with WebSocket support for serverless environments

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Fast development server and build tool with HMR support
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production server builds
- **Replit Integrations**: Development tooling for Replit environment including error overlays and dev banners

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **Connect-pg-simple**: PostgreSQL session store for Express sessions
- **Node.js Crypto**: Built-in cryptographic functions for password hashing

### State Management & Data Fetching
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Schema validation shared between client and server