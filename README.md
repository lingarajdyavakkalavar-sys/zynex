# Zypher - GATE & CAT Exam Preparation Platform

> AI-powered exam prep with real questions & smart analytics

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Render-336791)

## Features

- **GATE Test Engine** - 65 questions, 180 min, accurate negative marking (-0.33)
- **CAT Test Engine** - 66 questions, 120 min, sectional timing
- **Real Questions** - Seeded previous year questions (expandable)
- **Quiz Modes** - Practice, Timed Test, Revision, Previous Year, Mock
- **AI MCQ Generator** - OpenAI-powered question creation
- **Analytics Dashboard** - Performance tracking by topic & difficulty

## Tech Stack

| Frontend | Backend | Database | Auth |
|----------|---------|----------|------|
| Next.js 15 | Next.js API | PostgreSQL | Clerk |
| React 19 | Prisma ORM | Render.com | (optional) |
| Tailwind CSS | OpenAI | | |
| Framer Motion | | | |

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed questions (optional)
npx tsx scripts/seed-direct.ts

# Run dev server
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Deploy

1. Push to GitHub
2. Import to Vercel
3. Add env vars
4. Deploy

## License

MIT