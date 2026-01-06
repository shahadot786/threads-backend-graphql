# Project Roadmap

## ✅ Completed Features

### Phase 1: Project Setup
- [x] Initialize monorepo structure (backend + frontend)
- [x] Set up PostgreSQL with Docker Compose
- [x] Configure Prisma ORM with migrations
- [x] Set up TypeScript for both projects

### Phase 2: Backend - GraphQL API
- [x] Apollo Server 5 with Express 5
- [x] Modular GraphQL architecture (typeDefs, resolvers, services)
- [x] User model with Prisma schema
- [x] Password hashing with HMAC-SHA256 + salt
- [x] User registration mutation (createUser)
- [x] User queries (getUsers, getUserById, getUserByEmail)

### Phase 3: Authentication System
- [x] JWT access token generation (15 min expiry)
- [x] Refresh token model in database
- [x] Refresh token generation (7 day expiry)
- [x] httpOnly cookie-based token storage
- [x] Login mutation with cookie setting
- [x] Refresh token mutation with rotation
- [x] Logout mutation (single device)
- [x] LogoutAll mutation (all devices)
- [x] GraphQL context with user authentication
- [x] Route protection helper (requireAuth)
- [x] CORS configuration for credentials

### Phase 4: Frontend - Next.js App
- [x] Next.js 16 with App Router
- [x] Tailwind CSS 4 styling
- [x] Apollo Client 4 with credentials support
- [x] Login page with form validation
- [x] Register page with form validation
- [x] Profile page (protected)
- [x] Home page with auth state
- [x] Guest route protection (redirect logged-in users)
- [x] Protected route handling (redirect guests)

### Phase 5: Documentation
- [x] Root README
- [x] Backend README
- [x] Frontend README
- [x] Architecture documentation
- [x] Deployment guide
- [x] Contributing guide
- [x] Project roadmap (this file)

### Phase 6: Thread/Post Feature ✅ NEW
- [x] Post model in Prisma schema
- [x] PostMedia model for attachments
- [x] Post typeDefs and resolvers
- [x] Create post mutation
- [x] Update post mutation
- [x] Delete post mutation
- [x] Reply to post mutation
- [x] Get posts query (with pagination)
- [x] Get user's posts query
- [x] Get home feed query
- [x] Get trending posts query

### Phase 7: Social Features ✅ NEW
- [x] PostLike model (user-post relation)
- [x] Like/Unlike mutations
- [x] Like count on posts
- [x] Follow model (user-user relation) - already existed
- [x] Follow/Unfollow mutations - already existed
- [x] Follower/Following counts - already existed
- [x] Feed query (posts from followed users)

### Phase 8: Bookmarks ✅ NEW
- [x] Bookmark model
- [x] Add bookmark mutation
- [x] Remove bookmark mutation
- [x] Bookmarks on profile
- [x] Bookmark count

### Phase 9: Hashtags & Mentions ✅ NEW
- [x] Hashtag model with usage count
- [x] Parse hashtags from content
- [x] PostHashtag join table
- [x] PostMention join table
- [x] Get posts by hashtag query
- [x] Mention notifications

### Phase 10: Search ✅ NEW
- [x] Search users query
- [x] Search posts query
- [x] Search hashtags query
- [x] Trending hashtags query

### Phase 11: Guest Access ✅ NEW
- [x] Public post viewing
- [x] Public profile viewing
- [x] Public search
- [x] Private account handling

---

## 🚧 Next Steps

### Phase 12: Profile Enhancement
- [ ] Profile edit page (frontend)
- [ ] Image upload (Cloudinary/S3)
- [ ] Profile image display

### Phase 13: Production Readiness
- [ ] Input validation (Zod)
- [ ] Rate limiting
- [ ] Error handling middleware
- [ ] Logging (Pino)
- [ ] Dockerfiles for production
- [ ] CI/CD with GitHub Actions

### Phase 14: Advanced Features
- [ ] Real-time notifications (GraphQL Subscriptions)
- [ ] Direct messages
- [ ] Repost functionality

---

## 📊 Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Project Setup | ✅ Complete | 100% |
| Backend GraphQL | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Frontend App | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| Thread/Post | ✅ Complete | 100% |
| Social Features | ✅ Complete | 100% |
| Bookmarks | ✅ Complete | 100% |
| Hashtags & Mentions | ✅ Complete | 100% |
| Search | ✅ Complete | 100% |
| Guest Access | ✅ Complete | 100% |
| Profile Enhancement | 🔜 Next | 0% |
| Production Ready | ⏳ Planned | 0% |
| Advanced Features | ⏳ Planned | 0% |
