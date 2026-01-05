# Deployment Guide

## Deployment Options

### Option 1: Docker Compose (Recommended for Small Scale)

#### Production docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_GRAPHQL_URL: ${BACKEND_URL}/graphql

volumes:
  postgres_data:
```

### Option 2: Cloud Deployment

#### Backend (Render/Railway/Fly.io)

1. Connect your GitHub repository
2. Set build command: `yarn install && npx prisma generate && yarn build`
3. Set start command: `yarn start`
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`

#### Frontend (Vercel)

1. Import from GitHub
2. Framework preset: Next.js
3. Add environment variable:
   - `NEXT_PUBLIC_GRAPHQL_URL`

#### Database (Neon/Supabase/Railway)

1. Create PostgreSQL database
2. Copy connection string
3. Run migrations: `npx prisma migrate deploy`

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Server
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_GRAPHQL_URL=https://your-backend-domain.com/graphql
```

## SSL/HTTPS

For production, use HTTPS:
- **Render/Railway/Vercel**: SSL included automatically
- **Self-hosted**: Use nginx with Let's Encrypt

### Example nginx configuration

```nginx
server {
    listen 443 ssl;
    server_name api.threads-app.com;

    ssl_certificate /etc/letsencrypt/live/api.threads-app.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.threads-app.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Migrations

```bash
# Development
npx prisma migrate dev

# Production (apply pending migrations)
npx prisma migrate deploy

# Reset database (DANGER: deletes all data)
npx prisma migrate reset
```

## Health Checks

- Backend: `GET /` returns `{"message": "Hello, Threads App Backend!"}`
- GraphQL: `POST /graphql` with introspection query

## Monitoring Recommendations

- **Logging**: Pino or Winston
- **Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Uptime**: UptimeRobot or Pingdom
