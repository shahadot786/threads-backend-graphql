# Threads App

A full-featured social threads application built with GraphQL, Next.js, and PostgreSQL - a Threads/Twitter clone with modern features.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Apollo](https://img.shields.io/badge/Apollo_Server-5-purple)
![Prisma](https://img.shields.io/badge/Prisma-7-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 📁 Project Structure

```
threads-app/
├── backend/              # GraphQL API (Apollo Server + Express + Prisma)
├── frontend/             # Next.js Web Application
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── CONTRIBUTING.md   # Contribution guidelines
├── docker-compose.yml    # Docker services
├── TASK.md              # Project roadmap
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Yarn or npm

### 1. Clone & Install

```bash
git clone https://github.com/shahadot786/threads-clone.git
cd threads-clone
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Start Backend

```bash
cd backend
cp .env.example .env  # Configure environment
yarn install
npx prisma migrate dev
yarn dev
```
→ GraphQL API: http://localhost:8000/graphql

### 5. Start Frontend

```bash
cd frontend
cp .env.example .env.local  # Configure environment
yarn install
yarn dev
```
→ Web App: http://localhost:3000

## ✨ Features

### Core Features ✅
- **Posts/Threads** - Create, edit, delete posts with rich text
- **Media Upload** - Images, videos, and GIF support
- **Replies & Threads** - Nested conversation threads
- **Likes** - Like/unlike posts with counts
- **Reposts** - Share posts to your profile
- **Bookmarks** - Save posts for later (accessible via sidebar Pin)

### Social Features ✅
- **Follow System** - Follow/unfollow users
- **Activity Feed** - Notifications for likes, follows, mentions, replies
- **User Profiles** - Bio, stats, profile images
- **User Tooltips** - Hover to see user info with follow button

### Discovery ✅
- **Search** - Find users, posts, and hashtags
- **Hashtags** - #tag support with trending tags
- **@Mentions** - Mention users with autocomplete suggestions
- **Trending Posts** - Discover popular content

### Authentication ✅ (Supabase)
- **Supabase Auth** - Email/password with magic links
- **Email Verification** - Confirm email before login
- **Password Reset** - Secure reset via email
- **Protected Routes** - Frontend and backend guards
- **Session Management** - Secure cookie-based sessions

### UI/UX ✅
- **Dark Mode** - Beautiful dark theme by default
- **Responsive Design** - Works on mobile and desktop
- **Media Lightbox** - Full-screen media viewing
- **Quote Generator** - AI-powered quote suggestions
- **Emoji Picker** - Rich emoji support

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Apollo Client |
| **Backend** | Apollo Server 5, Express 5, TypeScript 5.9 |
| **Database** | PostgreSQL 16 (Supabase), Prisma 7 ORM |
| **Auth** | Supabase Auth (email + password) |
| **Real-time** | Socket.io for live updates |
| **Storage** | Local file storage / CDN-ready |
| **DevOps** | Docker, Railway, Vercel |

## 🚀 Live Demo

- **Frontend (Web App):** [threads-clone-three-nu.vercel.app](https://threads-clone-three-nu.vercel.app/)
- **Backend (GraphQL API):** [threads-clone-production-441a.up.railway.app/graphql](https://threads-clone-production-441a.up.railway.app/graphql)

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and data flow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment guide
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute
- [Task Roadmap](TASK.md) - What's done and what's next

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

Built with ❤️ using Next.js, Apollo, and PostgreSQL