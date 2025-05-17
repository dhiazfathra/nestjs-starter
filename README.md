# NestJS Starter Project

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/test.yml">
    <img src="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/test.yml/badge.svg" alt="Tests" />
  </a>
  <a href="https://codecov.io/gh/dhiazfathra/nestjs-starter">
    <img src="https://codecov.io/gh/dhiazfathra/nestjs-starter/graph/badge.svg" alt="Coverage" />
  </a>
  <a href="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/semantic-release.yml">
    <img src="https://github.com/dhiazfathra/nestjs-starter/actions/workflows/semantic-release.yml/badge.svg" alt="Semantic Release" />
  </a>
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
- 📚 **API Documentation** - Swagger/OpenAPI with custom scalar types

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

## API Documentation

The API is documented using Swagger/OpenAPI. When the application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

The documentation includes:

- Interactive API explorer
- Request/response schemas with examples
- Authentication requirements
- Custom scalar types for consistent data representation

### Scalar Types

The API uses the following scalar types for consistent data representation:

- **UUID** - For entity IDs (format: uuid)
- **Date** - For timestamps (format: date-time, ISO8601)
- **Email** - For email addresses (format: email)
- **Password** - For password fields (format: password)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/profile` - Get current user profile (requires authentication)

#### Users
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
│   │   ├── enums/       # Enumerations
│   │   └── scalars/     # Custom scalar types for API docs
│   ├── prisma/          # Prisma service
│   ├── users/           # Users module
│   │   ├── dto/         # Data transfer objects
│   │   └── entities/    # Entity definitions for API docs
│   ├── app.module.ts    # Main application module
│   └── main.ts          # Application entry point
└── test/                # Test files
```

## License

This project is [MIT licensed](LICENSE).
