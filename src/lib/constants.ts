export const EXAMS = [
  { id: 'GATE', name: 'GATE', color: '#0066cc' },
  { id: 'CAT', name: 'CAT', color: '#ea4335' },
  { id: 'SEMESTER', name: 'Semester', color: '#34a853' },
  { id: 'UNIVERSITY', name: 'University', color: '#fbbc04' },
] as const;

export const BRANCHES = [
  { id: 'cse', name: 'Computer Science', code: 'CS' },
  { id: 'ece', name: 'Electronics & Communication', code: 'EC' },
  { id: 'ee', name: 'Electrical Engineering', code: 'EE' },
  { id: 'me', name: 'Mechanical Engineering', code: 'ME' },
  { id: 'ce', name: 'Civil Engineering', code: 'CE' },
] as const;

export const SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Semester ${i + 1}`,
}));

export const GATE_BRANCHES = {
  cse: {
    name: 'Computer Science and Information Technology',
    code: 'CS',
    subjects: [
      { code: 'CS', name: 'Engineering Mathematics', topics: 5 },
      { code: 'CS', name: 'Digital Logic', topics: 4 },
      { code: 'CS', name: 'Computer Organization and Architecture', topics: 5 },
      { code: 'CS', name: 'Programming and Data Structures', topics: 6 },
      { code: 'CS', name: 'Algorithms', topics: 5 },
      { code: 'CS', name: 'Theory of Computation', topics: 4 },
      { code: 'CS', name: 'Compiler Design', topics: 4 },
      { code: 'CS', name: 'Operating System', topics: 5 },
      { code: 'CS', name: 'Databases', topics: 5 },
      { code: 'CS', name: 'Computer Networks', topics: 5 },
    ],
  },
  ece: {
    name: 'Electronics and Communication',
    code: 'EC',
    subjects: [
      { code: 'EC', name: 'Engineering Mathematics', topics: 5 },
      { code: 'EC', name: 'Networks, Signals and Systems', topics: 4 },
      { code: 'EC', name: 'Electronic Devices', topics: 4 },
      { code: 'EC', name: 'Analog Circuits', topics: 5 },
      { code: 'EC', name: 'Digital Circuits', topics: 4 },
      { code: 'EC', name: 'Signals and Systems', topics: 4 },
      { code: 'EC', name: 'Control Systems', topics: 4 },
      { code: 'EC', name: 'Communications', topics: 5 },
      { code: 'EC', name: 'Electromagnetic Fields', topics: 4 },
    ],
  },
  ee: {
    name: 'Electrical Engineering',
    code: 'EE',
    subjects: [
      { code: 'EE', name: 'Engineering Mathematics', topics: 5 },
      { code: 'EE', name: 'Electric Circuits', topics: 4 },
      { code: 'EE', name: 'Electromagnetic Fields', topics: 4 },
      { code: 'EE', name: 'Signals and Systems', topics: 4 },
      { code: 'EE', name: 'Electrical Machines', topics: 5 },
      { code: 'EE', name: 'Power Systems', topics: 5 },
      { code: 'EE', name: 'Control Systems', topics: 4 },
      { code: 'EE', name: 'Electrical and Electronic Measurements', topics: 4 },
      { code: 'EE', name: 'Analog and Digital Electronics', topics: 5 },
    ],
  },
  me: {
    name: 'Mechanical Engineering',
    code: 'ME',
    subjects: [
      { code: 'ME', name: 'Engineering Mathematics', topics: 5 },
      { code: 'ME', name: 'Applied Mechanics and Design', topics: 6 },
      { code: 'ME', name: 'Fluid Mechanics and Thermal Sciences', topics: 6 },
      { code: 'ME', name: 'Materials, Manufacturing and Industrial Engineering', topics: 6 },
    ],
  },
  ce: {
    name: 'Civil Engineering',
    code: 'CE',
    subjects: [
      { code: 'CE', name: 'Engineering Mathematics', topics: 5 },
      { code: 'CE', name: 'Structural Engineering', topics: 6 },
      { code: 'CE', name: 'Geotechnical Engineering', topics: 4 },
      { code: 'CE', name: 'Water Resources Engineering', topics: 4 },
      { code: 'CE', name: 'Environmental Engineering', topics: 4 },
      { code: 'CE', name: 'Transportation Engineering', topics: 4 },
      { code: 'CE', name: 'Surveying and Geology', topics: 4 },
    ],
  },
} as const;

export const CAT_SECTIONS = [
  { id: 'VARC', name: 'Verbal Ability and Reading Comprehension', subjects: 4 },
  { id: 'DILR', name: 'Data Interpretation and Logical Reasoning', subjects: 4 },
  { id: 'QA', name: 'Quantitative Aptitude', subjects: 5 },
] as const;