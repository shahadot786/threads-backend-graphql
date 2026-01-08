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
│  │  Users, Posts, Likes, Follows, Bookmarks, Notifications     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

```
┌────────────────────────────────────────┐
│                 users                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ username        VARCHAR (unique)       │
│ first_name      VARCHAR                │
│ last_name       VARCHAR (nullable)     │
│ email           VARCHAR (unique)       │
│ password        VARCHAR (hashed)       │
│ salt            VARCHAR                │
│ bio             TEXT (nullable)        │
│ website         VARCHAR (nullable)     │
│ profile_image   VARCHAR (nullable)     │
│ is_private      BOOLEAN                │
│ is_verified     BOOLEAN                │
│ created_at      TIMESTAMP              │
│ updated_at      TIMESTAMP              │
└────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌────────────────────────────────────────┐
│                 posts                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ content         TEXT                   │
│ author_id       UUID (FK → users)      │
│ parent_id       UUID (FK → posts)      │
│ visibility      ENUM                   │
│ likes_count     INT                    │
│ replies_count   INT                    │
│ reposts_count   INT                    │
│ created_at      TIMESTAMP              │
│ updated_at      TIMESTAMP              │
└────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌────────────────────────────────────────┐
│              post_media                 │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ post_id         UUID (FK → posts)      │
│ media_url       VARCHAR                │
│ media_type      ENUM (IMAGE/VIDEO/GIF) │
│ position        INT                    │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘
```

### Social Tables

```
┌────────────────────────────────────────┐
│               follows                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ follower_id     UUID (FK → users)      │
│ following_id    UUID (FK → users)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│              post_likes                 │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ user_id         UUID (FK → users)      │
│ post_id         UUID (FK → posts)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│              bookmarks                  │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ user_id         UUID (FK → users)      │
│ post_id         UUID (FK → posts)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│               reposts                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ user_id         UUID (FK → users)      │
│ post_id         UUID (FK → posts)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘
```

### Content Discovery Tables

```
┌────────────────────────────────────────┐
│              hashtags                   │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ tag             VARCHAR (unique)       │
│ usage_count     INT                    │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│           post_hashtags                 │
├────────────────────────────────────────┤
│ post_id         UUID (FK → posts)      │
│ hashtag_id      UUID (FK → hashtags)   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│           post_mentions                 │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ post_id         UUID (FK → posts)      │
│ user_id         UUID (FK → users)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘
```

### Notification & Auth Tables

```
┌────────────────────────────────────────┐
│            notifications                │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ user_id         UUID (FK → users)      │
│ actor_id        UUID (FK → users)      │
│ type            ENUM                   │
│ post_id         UUID (FK → posts)      │
│ is_read         BOOLEAN                │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│            refresh_tokens               │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ token           VARCHAR (unique)       │
│ user_id         UUID (FK → users)      │
│ expires_at      TIMESTAMP              │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│               blocks                    │
├────────────────────────────────────────┤
│ id              UUID (PK)              │
│ blocker_id      UUID (FK → users)      │
│ blocked_id      UUID (FK → users)      │
│ created_at      TIMESTAMP              │
└────────────────────────────────────────┘
```

## Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend Framework** | Next.js 16 | App Router, SSR, modern React |
| **CSS** | Tailwind CSS 4 | Utility-first, fast development |
| **GraphQL Client** | Apollo Client 4 | Caching, hooks, TypeScript support |
| **State Management** | Zustand | Lightweight, intuitive API |
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
6. **Input Validation** - GraphQL schema type validation
7. **Rate Limiting** - Protection against brute force attacks
