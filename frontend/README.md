# Frontend - Next.js Web App

Next.js 16 application with React 19, Tailwind CSS 4, and Apollo Client for GraphQL.

## 🏗 Architecture

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout with Apollo
│   │   ├── page.tsx           # Home feed
│   │   ├── [username]/        # User profile pages
│   │   ├── activity/          # Notifications/activity
│   │   ├── create/            # Create post page
│   │   ├── post/[id]/         # Single post view
│   │   ├── search/            # Search page
│   │   ├── tags/[tag]/        # Hashtag posts
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/
│   │   ├── layout/            # Sidebar, MainLayout, SettingsMenu
│   │   ├── post/              # PostCard, CreatePost, PostActions
│   │   ├── user/              # UserTooltip, BlockedUsersList
│   │   ├── auth/              # LoginModal, AuthCard
│   │   ├── profile/           # EditProfileModal
│   │   └── ui/                # Button, Avatar, Dialog, HoverCard
│   ├── graphql/               # Queries, mutations, fragments
│   ├── stores/                # Zustand state (auth, ui)
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Apollo client, utilities
└── public/                    # Static assets
```

## 📄 Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Home feed with trending posts |
| `/login` | Guest only | Login form |
| `/register` | Guest only | Registration form |
| `/@username` | Public | User profile with tabs |
| `/activity` | Protected | Notifications and activity |
| `/create` | Protected | Create/edit post |
| `/post/:id` | Public | Single post with replies |
| `/search` | Public | Search users, posts, hashtags |
| `/tags/:tag` | Public | Posts with hashtag |

## ✨ Key Features

### Post Creation
- Rich text input with auto-growing textarea
- Image, video, and GIF upload
- @mention autocomplete with user suggestions
- Quote generator for inspiration
- Emoji picker
- Edit existing posts

### Feed & Discovery
- Infinite scroll with pagination
- Trending posts section
- Hashtag support with clickable tags
- User search with follow suggestions

### Social Interactions
- Like/unlike with optimistic updates
- Reply threads with nesting
- Repost to profile
- Bookmark posts (accessible via sidebar Pin)
- Follow/unfollow users

### User Profiles
- Profile tabs: Threads, Replies, Reposts, Media, Saved (mobile), Blocked
- Edit profile modal
- Follow/follower counts
- User tooltips on hover

### Activity/Notifications
- Real-time activity feed
- Like, follow, mention, reply notifications
- Unread indicator

## 🔧 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛠 Development

```bash
yarn install    # Install dependencies
yarn dev        # Start dev server (port 3000)
yarn build      # Build for production
yarn start      # Start production server
yarn lint       # Run linting
```

## 🎨 Styling

- **Tailwind CSS 4** - Utility-first CSS
- **Dark theme** - Default dark mode with CSS variables
- **Glassmorphism** - Backdrop blur effects
- **Animations** - Smooth transitions and micro-interactions
- **Responsive** - Mobile-first design

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` | UI library |
| `@apollo/client` | GraphQL client |
| `tailwindcss` | CSS framework |
| `zustand` | State management |
| `lucide-react` | Icon library |
| `@radix-ui/*` | Headless UI components |
| `emoji-picker-react` | Emoji picker |
