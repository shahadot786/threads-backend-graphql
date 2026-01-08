# Backend - GraphQL API

Apollo Server 5 GraphQL API with Express 5, Prisma ORM, and JWT authentication.

## 🏗 Architecture

```
backend/
├── src/
│   ├── graphql/
│   │   ├── user/              # User authentication & profiles
│   │   ├── post/              # Posts, likes, bookmarks, reposts
│   │   ├── search/            # Search users, posts, hashtags
│   │   ├── report/            # Report system
│   │   ├── context.ts         # Auth context & cookies
│   │   ├── errors.ts          # Custom error handling
│   │   ├── index.ts           # Schema aggregation
│   │   └── server.ts          # Apollo Server setup
│   ├── lib/
│   │   └── prisma.ts          # Prisma client
│   └── index.ts               # Express entry point
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── uploads/                   # Media file storage
```

## 🔐 Authentication Flow

1. **Login** (`login` mutation) → Sets httpOnly cookies with JWT tokens
2. **API Requests** → Context extracts and verifies access token
3. **Token Refresh** (`refreshToken`) → Rotates refresh token
4. **Logout** → Clears cookies and invalidates tokens

## 📋 GraphQL Schema

### User Queries
```graphql
getUsers: [User!]!
getUserById(id: ID!): User
getUserByUsername(username: String!): User
getCurrentLoggedInUser: User
getSuggestedUsers(first: Int): [User!]!
```

### Post Queries
```graphql
getPost(id: ID!): Post
getUserPosts(userId: ID!, first: Int, after: String, filter: PostFilter): PostConnection
getHomeFeed(first: Int, after: String): PostConnection
getTrendingPosts(first: Int, after: String): PostConnection
getMyBookmarks(first: Int, after: String): PostConnection
getPostsByHashtag(tag: String!, first: Int, after: String): PostConnection
```

### Search Queries
```graphql
searchUsers(query: String!, first: Int, after: String): UserConnection
searchPosts(query: String!, first: Int, after: String): PostConnection
searchHashtags(query: String!, first: Int): [Hashtag!]!
getTrendingHashtags(first: Int): [Hashtag!]!
```

### User Mutations
```graphql
createUser(input: CreateUserInput!): User!
login(email: String!, password: String!): AuthResponse!
logout: Boolean!
refreshToken: AuthResponse!
updateUser(input: UpdateUserInput!): User!
followUser(userId: ID!): Boolean!
unfollowUser(userId: ID!): Boolean!
blockUser(userId: ID!): Boolean!
unblockUser(userId: ID!): Boolean!
```

### Post Mutations
```graphql
createPost(input: CreatePostInput!): Post!
updatePost(postId: ID!, input: UpdatePostInput!): Post!
deletePost(postId: ID!): Boolean!
likePost(postId: ID!): Boolean!
unlikePost(postId: ID!): Boolean!
bookmarkPost(postId: ID!): Boolean!
unbookmarkPost(postId: ID!): Boolean!
repostPost(postId: ID!): Boolean!
unrepostPost(postId: ID!): Boolean!
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
yarn install          # Install dependencies
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run migrations
yarn dev              # Start dev server
npx prisma studio     # Open Prisma Studio
```

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /graphql` | GraphQL API |
| `GET /graphql` | Apollo Sandbox |
| `POST /upload` | Media file upload |
| `GET /uploads/:file` | Serve uploaded files |

## 📦 Database Models

- **User** - User accounts and profiles
- **Post** - Threads/posts with content and metadata
- **PostMedia** - Images, videos, GIFs attached to posts
- **PostLike** - User likes on posts
- **Bookmark** - Saved posts
- **Repost** - Reposts/shares
- **Follow** - User follow relationships
- **Hashtag** - Post hashtags with usage counts
- **PostHashtag** - Post-hashtag associations
- **PostMention** - User mentions in posts
- **Notification** - Activity notifications
- **RefreshToken** - Auth refresh tokens
- **Block** - Blocked users
- **Report** - User/post reports
