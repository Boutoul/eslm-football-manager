# ESLM - Football Team Management App

## Overview

ESLM is a comprehensive football team management application designed for private football clubs. The application provides tools for managing player rosters, tracking player statistics and skills, and creating tactical team formations. Built as a modern web application with responsive design, it enables coaches and team managers to efficiently organize their teams and make data-driven decisions about player selection and team composition.

The application features a sophisticated points-based player evaluation system that considers multiple factors including player skills, preferred positions, strong foot preference, and various activities or status indicators. This allows for objective player comparison and optimal team formation based on tactical requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, leveraging modern React patterns including hooks and functional components. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router. State management is handled through React Query (TanStack Query) for server state and React's built-in useState/useContext for local component state.

The UI is constructed using shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable component library. Styling is implemented with Tailwind CSS using a custom design system with CSS variables for theming, including a football-specific color palette with soccer green and team blue variations.

### Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. The server implements a clean separation of concerns with distinct layers for routing, business logic, and data access. Routes are organized in a centralized router configuration that handles all API endpoints for players, teams, and settings management.

The application uses an in-memory storage implementation (MemStorage) that implements a common IStorage interface, allowing for easy migration to persistent database storage in the future. This design pattern provides flexibility and makes the codebase database-agnostic.

### Data Storage Solutions
The application now uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The storage layer has been fully migrated from in-memory storage to DatabaseStorage, implementing persistent data storage for all entities.

The database integration includes automatic initialization of default settings, proper error handling, and maintains the same IStorage interface for seamless backend compatibility. The schema includes advanced features like JSON fields for flexible data storage (activities, player positions, configuration objects) and proper UUID primary keys with automatic generation.

Migration was completed on January 1, 2025, using `npm run db:push` to synchronize the schema with the PostgreSQL database.

### Recent Updates (August 2025)
- **Team Composition System**: Complete overhaul of team management with advanced player positioning, presence tracking, and automatic team generation for two teams (A & B)
- **Visual Identity**: Transitioned from green to yellow and black color scheme throughout the application
- **Activity Organization**: Restructured club activities in player forms with categorized sections (Positions, Arbitrage, Services, Bonus & Pénalités)
- **Enhanced Formations**: Added 4-5-1 formation and dual-team generation capability with 11 starters + 3 substitutes per team
- **Points System Updates**: Arbitrage scoring adjusted (touche = 2 points, centre = 3 points)

### Component Architecture
The frontend follows a component-based architecture with clear separation between UI components, business logic components, and page-level components. Key architectural patterns include:

- **Compound Components**: Complex UI elements like modals and forms are built as compound components with multiple sub-components
- **Custom Hooks**: Business logic is extracted into custom hooks for reusability (e.g., useToast, useIsMobile)
- **Form Management**: React Hook Form with Zod validation provides robust form handling with type safety
- **State Management**: React Query handles server state with caching, background updates, and optimistic updates

### Validation and Type Safety
The application implements comprehensive type safety through TypeScript and runtime validation using Zod schemas. Database schemas are automatically converted to TypeScript types and Zod validation schemas using drizzle-zod, ensuring consistency between database structure, API contracts, and frontend types.

Form validation is handled through react-hook-form with Zod resolvers, providing both client-side validation and type-safe form data handling. The validation covers player creation/editing, team formation, and settings configuration.

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI components providing accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework for styling with custom design system
- **Lucide React**: Icon library providing consistent iconography
- **Class Variance Authority (CVA)**: Utility for creating variant-based component APIs

### Data Management
- **Drizzle ORM**: Type-safe SQL ORM for PostgreSQL with migration support
- **TanStack React Query**: Server state management with caching and synchronization
- **Zod**: Schema validation library for runtime type checking
- **React Hook Form**: Performant form library with minimal re-renders

### Development and Build Tools
- **Vite**: Modern build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Database and Hosting
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Vercel**: Planned deployment platform for both frontend and API
- **Environment Configuration**: Support for development and production environment variables

### Additional Utilities
- **Date-fns**: Date manipulation and formatting library
- **Wouter**: Lightweight client-side routing
- **Nanoid**: URL-safe unique ID generation
- **Connect-pg-simple**: PostgreSQL session store for Express sessions