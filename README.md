# Threads App Backend

A modern GraphQL backend API for a Threads-like social application, built with **Apollo Server 5**, **Express.js 5**, and **TypeScript**.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | JavaScript runtime |
| TypeScript | ^5.9.3 | Type-safe development |
| Express.js | ^5.2.1 | Web framework |
| Apollo Server | ^5.2.0 | GraphQL server |
| GraphQL | ^16.12.0 | Query language |

## Features

- 🚀 **GraphQL API** via Apollo Server
- 🔷 **TypeScript** for type safety
- ⚡ **Express 5** with native async/await support
- 🔄 **Hot Reload** development with `tsc-watch`
- 📦 **ES Modules** for modern JavaScript

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/threads-app-backend.git

# Navigate to the project
cd threads-app-backend

# Install dependencies
yarn install
# or
npm install
```

### Development

```bash
# Start development server with hot reload
yarn dev
# or
npm run dev
```

The server will start at `http://localhost:8000`

### Production

```bash
# Build the project
yarn build
# or
npx tsc

# Start production server
yarn start
# or
npm start
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
│   └── index.ts        # Main server entry point
├── dist/               # Compiled JavaScript output
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── LICENSE             # MIT License
└── README.md           # This file
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

*Built with ❤️ using Apollo Server, Express, and TypeScript*