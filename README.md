# Threads App Backend

A modern GraphQL backend API for a Threads-like social application, built with **Apollo Server 5**, **Express.js 5**, **TypeScript**, and **PostgreSQL**.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | JavaScript runtime |
| TypeScript | ^5.9.3 | Type-safe development |
| Express.js | ^5.2.1 | Web framework |
| Apollo Server | ^5.2.0 | GraphQL server |
| GraphQL | ^16.12.0 | Query language |
| PostgreSQL | 18+ | Database |
| Docker | Latest | Containerization |

## Features

- 🚀 **GraphQL API** via Apollo Server
- 🔷 **TypeScript** for type safety
- ⚡ **Express 5** with native async/await support
- 🐘 **PostgreSQL** database with Docker
- 🔄 **Hot Reload** development with `tsc-watch`
- 📦 **ES Modules** for modern JavaScript
- 🐳 **Docker Compose** for local development

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

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check - returns JSON message |
| `POST /graphql` | GraphQL API endpoint |

### GraphQL Playground

Access the Apollo GraphQL Playground at:
```
http://localhost:8000/graphql
```

### Example Query

```graphql
query {
  hello
}
```

Response:
```json
{
  "data": {
    "hello": "Hello from Apollo Server!"
  }
}
```

## Project Structure

```
threads-app-backend/
├── src/
│   └── index.ts          # Main server entry point
├── dist/                  # Compiled JavaScript output
├── docker-compose.yml     # PostgreSQL container config
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── LICENSE                # MIT License
└── README.md              # This file
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn start` | Start production server |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**MD. Shahadot Hossain**

---

*Built with ❤️ using Apollo Server, Express, TypeScript, and PostgreSQL*