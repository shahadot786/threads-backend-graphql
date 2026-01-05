# Threads App

A modern social threads application built with GraphQL, Next.js, and PostgreSQL featuring secure JWT authentication with refresh tokens.

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
git clone https://github.com/shahadot786/threads-backend-graphql.git
cd threads-backend-graphql
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Start Backend

```bash
cd backend
cp .env.example .env  # Configure environment
yarn install
npx prisma migrate dev
yarn dev
```
→ GraphQL API: http://localhost:8000/graphql

### 4. Start Frontend

```bash
cd frontend
yarn install
yarn dev
```
→ Web App: http://localhost:3000

## ✨ Features

### Implemented ✅
- **JWT Authentication** with secure httpOnly cookies
- **Refresh Token Rotation** for enhanced security
- **User Registration & Login** with password hashing (HMAC-SHA256)
- **Protected Routes** on both frontend and backend
- **Modular GraphQL Architecture** with type-safe resolvers
- **PostgreSQL** with Prisma ORM

### Coming Soon 🚧
- Thread creation and feed
- Likes and comments
- Follow system
- Real-time notifications
- Profile editing with image upload

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Apollo Client |
| **Backend** | Apollo Server 5, Express 5, TypeScript 5.9 |
| **Database** | PostgreSQL 16, Prisma 7 ORM |
| **Auth** | JWT, httpOnly Cookies, Refresh Tokens |
| **DevOps** | Docker, Docker Compose |

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide
- [Contributing](docs/CONTRIBUTING.md) - How to contribute
- [Task Roadmap](TASK.md) - What's done and what's next

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

Built with ❤️ using Next.js, Apollo, and PostgreSQL