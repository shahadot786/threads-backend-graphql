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

---

## 🚧 Next Steps

### Phase 6: Thread/Post Feature
- [ ] Thread model in Prisma schema
- [ ] Thread typeDefs and resolvers
- [ ] Create thread mutation
- [ ] Get threads query (with pagination)
- [ ] Get user's threads query
- [ ] Thread detail page
- [ ] Create thread form

### Phase 7: Social Features
- [ ] Like model (user-thread relation)
- [ ] Like/Unlike mutations
- [ ] Like count on threads
- [ ] Follow model (user-user relation)
- [ ] Follow/Unfollow mutations
- [ ] Follower/Following counts
- [ ] Feed query (threads from followed users)

### Phase 8: Comments
- [ ] Comment model
- [ ] Add comment mutation
- [ ] Delete comment mutation
- [ ] Comments on thread detail
- [ ] Comment count

### Phase 9: Profile Enhancement
- [ ] Profile edit mutation
- [ ] Image upload (Cloudinary/S3)
- [ ] Profile image display
- [ ] Edit profile page

### Phase 10: Production Readiness
- [ ] Input validation (Zod)
- [ ] Rate limiting
- [ ] Error handling middleware
- [ ] Logging (Pino)
- [ ] Health check endpoint
- [ ] Dockerfiles for production
- [ ] CI/CD with GitHub Actions

### Phase 11: Advanced Features
- [ ] Real-time notifications (GraphQL Subscriptions)
- [ ] Search (users and threads)
- [ ] Hashtags
- [ ] Mentions (@username)
- [ ] Direct messages

---

## 📊 Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Project Setup | ✅ Complete | 100% |
| Backend GraphQL | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Frontend App | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| Threads/Posts | 🔜 Next | 0% |
| Social Features | ⏳ Planned | 0% |
| Comments | ⏳ Planned | 0% |
| Profile Enhancement | ⏳ Planned | 0% |
| Production Ready | ⏳ Planned | 0% |
| Advanced Features | ⏳ Planned | 0% |
