# Overview

ModernStore is a full-stack e-commerce web application built with React, TypeScript, Express.js, and PostgreSQL. It provides a complete online shopping experience with user authentication, product catalog browsing, cart management, and order processing. The application features an admin dashboard for product management and uses modern web technologies for a responsive, performant user interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for authentication and cart state
- **Data Fetching**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design system
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with proper error handling
- **Middleware**: Custom logging, authentication, and authorization middleware

## Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Tables**: Users, products, cart items, orders, and order items with proper relationships
- **Data Validation**: Zod schemas shared between frontend and backend for consistent validation

## Authentication & Authorization
- **User Authentication**: JWT tokens stored in localStorage
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: Admin vs regular user permissions
- **Protected Routes**: Middleware-based route protection
- **Session Persistence**: Automatic token validation and user state restoration

## Code Organization
- **Monorepo Structure**: Client, server, and shared code in organized directories
- **Shared Types**: Database schemas and validation logic shared between frontend and backend
- **Component Architecture**: Reusable UI components with proper prop typing
- **Custom Hooks**: Centralized logic for authentication, cart management, and data fetching
- **Context Providers**: Global state management for user session and shopping cart

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit**: Development and hosting environment with integrated tooling

## UI & Styling
- **Radix UI**: Headless, accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library
- **Google Fonts**: Custom typography (Inter, DM Sans, Fira Code, Geist Mono)

## Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcrypt**: Password hashing and verification
- **Zod**: Runtime type validation and schema definition

## Data Management
- **TanStack React Query**: Server state management, caching, and synchronization
- **Drizzle ORM**: Type-safe database operations and query building
- **React Hook Form**: Form state management and validation

## Development Tools
- **TypeScript**: Static type checking across the entire codebase
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Plugins**: Development environment enhancements and error handling