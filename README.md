# Threads App Backend

A modern GraphQL backend API for a Threads-like social application, built with **Apollo Server 5**, **Express.js 5**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | JavaScript runtime |
| TypeScript | ^5.9.3 | Type-safe development |
| Express.js | ^5.2.1 | Web framework |
| Apollo Server | ^5.2.0 | GraphQL server |
| GraphQL | ^16.12.0 | Query language |
| Prisma | ^7.2.0 | Database ORM |
| PostgreSQL | 18+ | Database |
| Docker | Latest | Containerization |

## Features

- 🚀 **GraphQL API** via Apollo Server 5
- 🔷 **TypeScript** for type safety
- 🔐 **Prisma ORM** with type-safe database queries
- ⚡ **Express 5** with native async/await support
- 🐘 **PostgreSQL** database with Docker
- 🔄 **Hot Reload** development with `tsc-watch`
- 📦 **ES Modules** for modern JavaScript
- 🐳 **Docker Compose** for local development
- 🧩 **Modular GraphQL** architecture

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/threads-app-backend.git

# Navigate to the project
cd threads-app-backend

# Install dependencies
yarn install
```

### Start Database

```bash
# Start PostgreSQL container
docker compose up -d

# Check if container is running
docker ps
```

### Database Setup with Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Development

```bash
# Start development server with hot reload
yarn dev
```

The server will start at `http://localhost:8000`

### Production

```bash
# Build the project
npx tsc

# Start production server
yarn start
```

## Project Structure

```
threads-app-backend/
├── src/
│   ├── graphql/
│   │   ├── index.ts              # Merges all GraphQL modules
│   │   └── user/
│   │       ├── user.typeDefs.ts  # User GraphQL schema
│   │       ├── user.resolvers.ts # User query/mutation resolvers
│   │       └── user.service.ts   # User database operations
│   ├── lib/
│   │   └── prisma.ts             # Prisma client instance
│   └── index.ts                  # Main server entry point
├── prisma/
│   ├── schema.prisma             # Prisma schema (models)
│   └── migrations/               # Database migrations
├── generated/
│   └── prisma/                   # Generated Prisma Client
├── dist/                         # Compiled JavaScript output
├── docker-compose.yml            # PostgreSQL container config
├── prisma.config.ts              # Prisma configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── LICENSE                       # MIT License
└── README.md                     # This file
```

## Database Models

### User

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| firstName | String | User's first name |
| lastName | String? | User's last name (optional) |
| profileImageUrl | String? | Profile image URL (optional) |
| email | String | Unique email address |
| password | String | Hashed password |
| salt | String | Password salt |

## GraphQL API

### Endpoint

```
POST http://localhost:8000/graphql
```

Access Apollo Sandbox at: `http://localhost:8000/graphql`

### Queries

```graphql
# Get all users
query {
  getUsers {
    id
    firstName
    lastName
    email
  }
}

# Get user by ID
query {
  getUserById(id: "uuid-here") {
    id
    firstName
    email
  }
}
```

### Mutations

```graphql
# Create a new user
mutation {
  createUser(
    firstName: "John"
    lastName: "Doe"
    email: "john.doe@example.com"
    password: "securePassword123"
  ) {
    id
    firstName
    lastName
    email
  }
}
```

## Database Configuration

PostgreSQL runs in Docker with the following default credentials:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `threads` |
| User | `postgres` |
| Password | `threads` |

### Docker Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# View logs
docker logs threads-db

# Reset database (removes all data)
docker compose down -v
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn start` | Start production server |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma Studio GUI |

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:threads@localhost:5432/threads
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `DATABASE_URL` | - | PostgreSQL connection string |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**MD. Shahadot Hossain**

---

*Built with ❤️ using Apollo Server, Express, TypeScript, Prisma, and PostgreSQL*