# Backend - GraphQL API

Apollo Server 5 GraphQL API with Express 5, Prisma ORM, and JWT authentication.

## 🏗 Architecture

```
backend/
├── src/
│   ├── graphql/
│   │   ├── user/              # User module
│   │   │   ├── user.typeDefs.ts
│   │   │   ├── user.resolvers.ts
│   │   │   └── user.service.ts
│   │   ├── context.ts         # Auth context & cookies
│   │   ├── index.ts           # Schema aggregation
│   │   └── server.ts          # Apollo Server setup
│   ├── lib/
│   │   └── prisma.ts          # Prisma client
│   └── index.ts               # Express entry point
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── generated/                 # Generated Prisma client
```

## 🔐 Authentication Flow

1. **Login** (`login` mutation)
   - Validates credentials
   - Generates access token (15min) + refresh token (7 days)
   - Sets httpOnly cookies

2. **API Requests**
   - Browser sends cookies automatically
   - Context extracts and verifies access token
   - User attached to GraphQL context

3. **Token Refresh** (`refreshToken` mutation)
   - Old refresh token deleted (rotation)
   - New token pair generated

4. **Logout** (`logout` mutation)
   - Deletes refresh token from database
   - Clears cookies

## 📋 GraphQL Schema

### Queries (Protected)
```graphql
getUsers: [User!]!
getUserById(id: String!): User
getUserByEmail(email: String): User
getCurrentLoggedInUser: User
```

### Mutations
```graphql
# Public
createUser(firstName: String!, lastName: String, email: String!, password: String!): User!
login(email: String!, password: String!): AuthResponse!
refreshToken: AuthResponse!

# Protected
logout: Boolean!
logoutAll: Boolean!
```

## 🔧 Environment Variables

```env
# Required
DATABASE_URL=postgresql://postgres:threads@localhost:5432/threads
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Optional
PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 🛠 Development

```bash
# Install dependencies
yarn install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
yarn dev

# Open Prisma Studio
npx prisma studio
```

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /graphql` | GraphQL API |
| `GET /graphql` | Apollo Sandbox |

## 🧪 Testing with cURL

```bash
# Login
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"query": "mutation { login(email: \"test@example.com\", password: \"test123\") { accessToken user { id firstName } } }"}'

# Protected query (with cookies)
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"query": "query { getCurrentLoggedInUser { id firstName email } }"}'
```
