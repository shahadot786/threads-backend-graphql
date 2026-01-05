# Contributing to Threads App

Thank you for your interest in contributing! 🎉

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/threads-app.git
cd threads-app
```

### 2. Set Up Development Environment

```bash
# Start PostgreSQL
docker compose up -d

# Backend
cd backend
cp .env.example .env
yarn install
npx prisma migrate dev
yarn dev

# Frontend (new terminal)
cd frontend
yarn install
yarn dev
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Guidelines

### Code Style

- **TypeScript** - All code must be typed
- **ESLint** - Run `yarn lint` before committing
- **Prettier** - Format on save (recommended)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add thread creation
fix: resolve login redirect issue
docs: update API documentation
refactor: improve auth service
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code improvements

## Pull Request Process

1. **Update your branch** with main
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test your changes**
   - Backend compiles without errors
   - Frontend builds successfully
   - All existing functionality works

3. **Create PR** with clear description
   - What does this PR do?
   - How to test it?
   - Screenshots (if UI changes)

4. **Address review feedback**

## Project Structure

### Adding a New GraphQL Module

1. Create folder: `backend/src/graphql/[module]/`
2. Add files:
   - `[module].typeDefs.ts` - GraphQL schema
   - `[module].resolvers.ts` - Query/Mutation handlers
   - `[module].service.ts` - Business logic
3. Export from `backend/src/graphql/index.ts`

### Adding a New Page

1. Create: `frontend/src/app/[route]/page.tsx`
2. Add auth check if needed (protected/guest-only)
3. Use Apollo hooks for data fetching

## Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
