# Zypher - GATE & CAT Exam Preparation Platform

## 🎯 Project Overview
AI-driven exam preparation platform for GATE and CAT with real questions, smart test engines, and performance analytics.

---

## 🏆 Hackathon Submission

### Problem Statement
Students preparing for GATE and CAT struggle with:
- Scattered study materials across multiple sources
- No access to authentic previous year questions
- Lack of accurate exam pattern simulation
- No way to track weak areas and progress

### Solution
Zypher provides a unified platform with:
- **Real questions** from previous years
- **Accurate test engines** matching GATE/CAT pattern
- **Smart analytics** for performance tracking
- **AI-powered** question generation

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **GATE Test Engine** | 65 questions, 180 min, -0.33 negative marking |
| **CAT Test Engine** | 66 questions, 120 min, sectional timing |
| **Question Bank** | Real GATE questions seeded (expandable) |
| **Quiz Modes** | Practice, Timed, Revision, Previous Year, Mock |
| **AI MCQ Generator** | OpenAI-powered question creation |
| **Analytics** | Performance by topic, difficulty, accuracy |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Render.com)
- **Auth:** Clerk (optional - demo mode available)
- **AI:** OpenAI API for MCQ generation

---

## 📊 Database Schema

```
User → QuizSession → MCQAttempt → MCQ
  ↓
GATEBranch → GATESubject → GATETopic
```

**Key Models:**
- `User` - Profile, exam preferences
- `MCQ` - Question bank with options, marks, difficulty
- `QuizSession` - Test state, timer, results
- `GATEBranch/Subject/Topic` - Syllabus hierarchy

---

## ⚡ Quick Start

```bash
# Install
npm install

# Database
npx prisma generate
npx prisma db push

# Seed questions (optional)
npx tsx scripts/seed-direct.ts

# Run
npm run dev
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/           # Next.js pages & API
│   ├── components/    # UI components
│   ├── lib/           # Utilities, config, db
│   └── hooks/         # Custom hooks
├── prisma/
│   └── schema.prisma  # Database schema
├── scripts/           # Seed & utility scripts
└── public/            # Static assets
```

---

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 🎯 GATE Exam Pattern (Implemented)

| Section | Questions | Marks |
|---------|-----------|-------|
| General Aptitude | 10 | 15 |
| Technical | 55 | 85 |
| **Total** | **65** | **100** |

- Duration: 180 minutes
- Negative: -0.33 (1-mark), -0.66 (2-mark)

---

## 🎯 CAT Exam Pattern (Implemented)

| Section | Questions | Time |
|---------|-----------|------|
| VARC | 24 | 40 min |
| DILR | 20 | 40 min |
| QA | 22 | 40 min |
| **Total** | **66** | **120 min** |

- +3 for correct, -1 for wrong (MCQ)

---

## 🔮 Future Roadmap

- [ ] Add EC, EE, ME question banks
- [ ] AI-generated explanations
- [ ] Leaderboards & peer comparison
- [ ] Mobile app (React Native)
- [ ] Video lessons integration

---

## 👨‍💻 Team

Built with ❤️ for GATE & CAT aspirants

---

## 📄 License

MIT