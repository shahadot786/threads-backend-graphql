# Contributing to Threads App

Thank you for your interest in contributing! 🎉

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/shahadot786/threads-clone.git
cd threads-clone
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
cp .env.example .env.local
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
chore: update dependencies
```

### Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code improvements |
| `chore/` | Maintenance tasks |

## Pull Request Process

### Before Submitting

- [ ] Branch is up to date with `master`
- [ ] Code compiles without errors (`npx tsc --noEmit`)
- [ ] No console errors in browser
- [ ] Existing features still work
- [ ] New code follows project patterns

### Creating a PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - What does this PR do?
   - How to test it?
   - Screenshots (if UI changes)

4. **Wait for CI** - Ensure checks pass

5. **Address review feedback** promptly

## Code Review Checklist

Reviewers will check:

- [ ] Code is readable and well-structured
- [ ] TypeScript types are correct
- [ ] No security vulnerabilities
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed
- [ ] Tests added (if applicable)

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
4. Add to navigation if needed

## Issue Guidelines

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check if it's already fixed in `master`

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots or error logs

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Problem description
- Proposed solution
- Alternative approaches considered

## Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
