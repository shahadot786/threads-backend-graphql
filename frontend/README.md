# Frontend - Next.js Web App

Next.js 16 application with React 19, Tailwind CSS 4, and Apollo Client for GraphQL.

## 🏗 Architecture

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout with Apollo
│   │   ├── page.tsx           # Home page
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   └── profile/page.tsx   # User profile (protected)
│   ├── components/
│   │   └── apollo-wrapper.tsx # Apollo Provider wrapper
│   ├── graphql/
│   │   └── user.ts            # GraphQL queries & mutations
│   └── lib/
│       └── apollo-client.tsx  # Apollo Client setup
└── public/                    # Static assets
```

## 🔐 Authentication

- **Cookie-based auth** - httpOnly cookies set by backend
- **Automatic credential inclusion** - Apollo Client configured with `credentials: "include"`
- **Route protection**:
  - `/login` & `/register` → Redirect to `/profile` if authenticated
  - `/profile` → Redirect to `/login` if not authenticated

## 📄 Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Home page with welcome message |
| `/login` | Guest only | Login form |
| `/register` | Guest only | Registration form |
| `/profile` | Protected | User profile details |

## 🔧 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
```

## 🛠 Development

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint
```

## 🎨 Styling

- **Tailwind CSS 4** for utility-first styling
- **Dark theme** with gradient backgrounds
- **Glassmorphism** effects (backdrop-blur)
- **Responsive** design

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.1 | React framework |
| `react` | 19.2.3 | UI library |
| `@apollo/client` | 4.0.11 | GraphQL client |
| `tailwindcss` | 4.x | CSS framework |
