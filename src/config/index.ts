export const AI_CONFIG = {
  providers: {
    openai: {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.7,
    },
    gemini: {
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      maxTokens: 2048,
      temperature: 0.7,
    },
  },
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
  streaming: {
    enabled: true,
    chunkSize: 32,
  },
} as const;

export const ROUTES = {
  public: ['/', '/sign-in', '/sign-up'],
  student: [
    '/dashboard',
    '/planner',
    '/workspace',
    '/revision',
    '/mcq',
    '/mindmap',
    '/analytics',
  ],
  admin: [
    '/admin',
    '/admin/syllabus',
    '/admin/topics',
    '/admin/analytics',
    '/admin/users',
  ],
} as const;

export const EXAM_TYPES = {
  GATE: {
    label: 'GATE',
    description: 'Graduate Aptitude Test in Engineering',
    color: 'blue',
  },
  CAT: {
    label: 'CAT',
    description: 'Common Admission Test',
    color: 'purple',
  },
  SEMESTER: {
    label: 'Semester',
    description: 'University Semester Exam',
    color: 'emerald',
  },
  UNIVERSITY: {
    label: 'University',
    description: 'College/University Subject',
    color: 'amber',
  },
} as const;

export const DIFFICULTY_COLORS = {
  EASY: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  MEDIUM: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  HARD: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
} as const;

export const STATUS_COLORS = {
  NOT_STARTED: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  MARKED_FOR_REVISION: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
} as const;

export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted-foreground))',
  chart: [
    'hsl(217.2 91.2% 59.8%)',
    'hsl(262.1 83.2% 57.8%)',
    'hsl(142.1 76.2% 36.3%)',
    'hsl(24.6 95% 53.1%)',
    'hsl(0 84.2% 60.2%)',
  ],
} as const;