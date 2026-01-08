import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // Use DIRECT_URL (Session mode pooler) for Prisma CLI operations
    // Falls back to DATABASE_URL if DIRECT_URL not set
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
})
