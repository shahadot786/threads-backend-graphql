# System Architecture

## Overview

Threads App follows a modern full-stack architecture with a clear separation between frontend and backend.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Next.js Frontend                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │    Pages    │  │  Components │  │    Apollo Client    │  │    │
│  │  │ (App Router)│  │   (React)   │  │ (GraphQL + Cookies) │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS + Cookies
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Express + Apollo Server                   │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │    │
│  │  │   GraphQL   │  │   Context   │  │    Middleware       │  │    │
│  │  │  Resolvers  │  │ (Auth/User) │  │ (CORS, Cookies)     │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      PostgreSQL                              │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐   │    │
│  │  │    users    │  │         refresh_tokens              │   │    │
│  │  └─────────────┘  └─────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │      │   Database   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  1. Login Request   │                     │
       │ ──────────────────► │                     │
       │                     │  2. Validate User   │
       │                     │ ──────────────────► │
       │                     │ ◄─────────────────  │
       │                     │                     │
       │                     │  3. Create Tokens   │
       │                     │ ──────────────────► │
       │                     │                     │
       │  4. Set Cookies     │                     │
       │ ◄──────────────────  │                     │
       │   (httpOnly)        │                     │
       │                     │                     │
       │  5. API Request     │                     │
       │ ──────────────────► │                     │
       │   (with cookies)    │                     │
       │                     │  6. Verify Token    │
       │                     │  7. Get User        │
       │                     │ ──────────────────► │
       │                     │ ◄─────────────────  │
       │  8. Response        │                     │
       │ ◄──────────────────  │                     │
```

## Database Schema

```
┌────────────────────────────────────────┐
│                 users                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ first_name      VARCHAR                │
│ last_name       VARCHAR (nullable)     │
│ profile_image_url VARCHAR (nullable)   │
│ email           VARCHAR (unique)       │
│ password        VARCHAR (hashed)       │
│ salt            VARCHAR                │
│ created_at      TIMESTAMP              │
│ updated_at      TIMESTAMP              │
└────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌────────────────────────────────────────┐
│            refresh_tokens               │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ token           VARCHAR (unique)       │
│ user_id         UUID (FK → users.id)   │
│ expires_at      TIMESTAMP              │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘
```

## Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Framework** | Next.js 16 | App Router, SSR, modern React |
| **CSS** | Tailwind CSS 4 | Utility-first, fast development |
| **GraphQL Client** | Apollo Client 4 | Caching, hooks, TypeScript support |
| **Backend Framework** | Express 5 | Mature, flexible, middleware ecosystem |
| **GraphQL Server** | Apollo Server 5 | Industry standard, great DX |
| **ORM** | Prisma 7 | Type-safe, migrations, easy schema |
| **Database** | PostgreSQL 16 | Reliable, scalable, feature-rich |
| **Auth** | JWT + Cookies | Stateless, secure httpOnly cookies |

## Security Measures

1. **Password Hashing** - HMAC-SHA256 with random salt
2. **httpOnly Cookies** - Prevents XSS token theft
3. **Refresh Token Rotation** - Old token invalidated on refresh
4. **Short-lived Access Tokens** - 15 minute expiry
5. **CORS Configuration** - Restricted to frontend origin
