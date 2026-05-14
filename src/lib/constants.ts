export const EXAMS = [
  { id: 'GATE', name: 'GATE', color: '#0066cc' },
  { id: 'CAT', name: 'CAT', color: '#ea4335' },
] as const;

export const GATE_BRANCHES = {
  cs: {
    name: 'Computer Science and Information Technology',
    code: 'CS',
    fullCode: 'CS',
    subjects: [
      { code: 'MA', name: 'Engineering Mathematics' },
      { code: 'DL', name: 'Digital Logic' },
      { code: 'CO', name: 'Computer Organization and Architecture' },
      { code: 'PD', name: 'Programming and Data Structures' },
      { code: 'AL', name: 'Algorithms' },
      { code: 'TC', name: 'Theory of Computation' },
      { code: 'CD', name: 'Compiler Design' },
      { code: 'OS', name: 'Operating System' },
      { code: 'DB', name: 'Databases' },
      { code: 'CN', name: 'Computer Networks' },
      { code: 'GA', name: 'General Aptitude' },
    ],
  },
} as const;

export const CAT_SECTIONS = {
  VARC: {
    name: 'Verbal Ability and Reading Comprehension',
    code: 'VARC',
    subsections: [
      { id: 'RC', name: 'Reading Comprehension' },
      { id: 'VA', name: 'Verbal Ability' },
      { id: 'VR', name: 'Verbal Reasoning' },
    ],
  },
  DILR: {
    name: 'Data Interpretation and Logical Reasoning',
    code: 'DILR',
    subsections: [
      { id: 'DI', name: 'Data Interpretation' },
      { id: 'LR', name: 'Logical Reasoning' },
    ],
  },
  QA: {
    name: 'Quantitative Aptitude',
    code: 'QA',
    subsections: [
      { id: 'AR', name: 'Arithmetic' },
      { id: 'AL', name: 'Algebra' },
      { id: 'GM', name: 'Geometry and Mensuration' },
      { id: 'MM', name: 'Modern Mathematics' },
    ],
  },
} as const;

export const DIFFICULTY_LEVELS = [
  { id: 'EASY', name: 'Easy', color: '#34a853' },
  { id: 'MEDIUM', name: 'Medium', color: '#fbbc04' },
  { id: 'HARD', name: 'Hard', color: '#ea4335' },
] as const;

export const QUIZ_MODES = [
  { id: 'PRACTICE', name: 'Practice', description: 'No time limit, instant feedback' },
  { id: 'TIMED_TEST', name: 'Timed Test', description: 'Simulate real exam conditions' },
  { id: 'REVISION', name: 'Revision', description: 'Focus on weak areas' },
  { id: 'SECTIONAL', name: 'Sectional', description: 'Practice specific sections' },
  { id: 'FULL_TEST', name: 'Full Test', description: 'Complete mock test' },
] as const;

export const QUIZ_QUESTION_COUNTS = [5, 10, 15, 20, 25, 30] as const;

export const TOPIC_DIFFICULTY = {
  EASY: 'Basic understanding required',
  MEDIUM: 'Conceptual understanding needed',
  HARD: 'In-depth analysis required',
} as const;

export const GATE_CS_SUBJECTS = [
  'Engineering Mathematics',
  'Digital Logic',
  'Computer Organization and Architecture',
  'Programming and Data Structures',
  'Algorithms',
  'Theory of Computation',
  'Compiler Design',
  'Operating System',
  'Databases',
  'Computer Networks',
  'General Aptitude',
] as const;

export const CAT_VARC_TOPICS = [
  'Reading Comprehension',
  'Para Jumbles',
  'Para Summary',
  'Odd Sentence Out',
  'Word Usage',
  'Critical Reasoning',
  'Facts Inference Judgment',
  'Paragraph Completion',
] as const;

export const CAT_DILR_TOPICS = [
  'Tables',
  'Bar Charts',
  'Line Graphs',
  'Pie Charts',
  'Caselets',
  'Blood Relations',
  'Coding-Decoding',
  'Number Series',
  'Syllogism',
  'Seating Arrangement',
  'Puzzles',
] as const;

export const CAT_QA_TOPICS = [
  'Percentages',
  'Profit and Loss',
  'Simple and Compound Interest',
  'Ratio and Proportion',
  'Time and Work',
  'Time Speed and Distance',
  'Averages',
  'Linear Equations',
  'Quadratic Equations',
  'Logarithms',
  'Functions',
  'Triangles',
  'Circles',
  'Quadrilaterals',
  '3D Geometry',
  'Permutation and Combination',
  'Probability',
  'Set Theory',
] as const;