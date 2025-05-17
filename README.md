# NestJS Starter Project

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

A NestJS TypeScript starter project with user authentication, following best practices, DRY and SOLID principles. This project provides a solid foundation for building secure and scalable backend applications.

## Features

- 🔐 **Authentication** - JWT-based authentication system
- 👤 **User Management** - Complete CRUD operations for users
- 🔑 **Role-Based Access Control** - User and Admin roles with proper guards
- 🗃️ **Database Integration** - PostgreSQL with Prisma ORM
- ✅ **Validation** - Request validation using class-validator
- 🔄 **Environment Configuration** - Using dotenv and NestJS ConfigModule

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

## Installation

```bash
# Install dependencies
$ npm install

# Generate Prisma client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev --name init
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="1d"

# Application
PORT=3000
```

## Running the app

```bash
# Development mode
$ npm run start

# Watch mode (recommended for development)
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/profile` - Get current user profile (requires authentication)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (authenticated users)
- `PATCH /api/users/:id` - Update user (authenticated users)
- `DELETE /api/users/:id` - Delete user (admin only)

## Project Structure

```
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── auth/            # Authentication module
│   │   ├── decorators/  # Custom decorators
│   │   ├── dto/         # Data transfer objects
│   │   ├── guards/      # Authentication guards
│   │   └── strategies/  # Passport strategies
│   ├── common/          # Shared resources
│   │   └── enums/       # Enumerations
│   ├── prisma/          # Prisma service
│   ├── users/           # Users module
│   │   └── dto/         # Data transfer objects
│   ├── app.module.ts    # Main application module
│   └── main.ts          # Application entry point
└── test/                # Test files
```

## License

This project is [MIT licensed](LICENSE).
