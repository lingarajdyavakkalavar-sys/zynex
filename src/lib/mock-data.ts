import { MCQ, Note, Flashcard, StudySession, BacklogItem, Syllabus } from './types';

export const mockUser = {
  id: '1',
  name: 'Arnav Sharma',
  email: 'arnav.sharma@example.com',
  avatar: '',
  examType: 'gate',
  branch: 'cse',
  semester: 5,
};

export const mockSyllabus: Syllabus = {
  id: '1',
  subject: 'Data Structures',
  branch: 'cse',
  semester: 5,
  progress: 65,
  topics: [
    { id: '1', name: 'Arrays', completed: true, subtopics: ['1D Arrays', '2D Arrays', 'Dynamic Arrays'] },
    { id: '2', name: 'Linked Lists', completed: true, subtopics: ['Singly', 'Doubly', 'Circular'] },
    { id: '3', name: 'Stacks', completed: true, subtopics: ['Implementation', 'Applications'] },
    { id: '4', name: 'Queues', completed: true, subtopics: ['Array Implementation', 'Circular Queue'] },
    { id: '5', name: 'Trees', completed: false, subtopics: ['BST', 'AVL', 'B-Trees'] },
    { id: '6', name: 'Graphs', completed: false, subtopics: ['BFS', 'DFS', 'Dijkstra'] },
    { id: '7', name: 'Sorting', completed: false, subtopics: ['Merge Sort', 'Quick Sort', 'Heap Sort'] },
    { id: '8', name: 'Hashing', completed: false, subtopics: ['Hash Functions', 'Collision Handling'] },
  ],
};

export const mockMCQs: MCQ[] = [
  {
    id: '1',
    question: 'What is the time complexity of inserting an element at the beginning of an array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 1,
    explanation: 'Array elements need to be shifted to make space for the new element at the beginning, which takes O(n) time.',
    difficulty: 'easy',
    topic: 'Arrays',
  },
  {
    id: '2',
    question: 'Which data structure is used to implement a function call stack?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswer: 1,
    explanation: 'Function calls are managed using a stack (LIFO principle) to track return addresses and local variables.',
    difficulty: 'easy',
    topic: 'Stacks',
  },
  {
    id: '3',
    question: 'In a circular linked list, what is the time complexity to insert an element at the end?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 1,
    explanation: 'Even in a circular list, we need to traverse to the last node to update the pointer, taking O(n) time.',
    difficulty: 'medium',
    topic: 'Linked Lists',
  },
  {
    id: '4',
    question: 'Which traversal of a binary tree visits nodes in depth-first order?',
    options: ['Level Order', 'Inorder', 'Breadth First', 'None'],
    correctAnswer: 1,
    explanation: 'Inorder, Preorder, and Postorder are depth-first traversals that explore as far as possible along each branch before backtracking.',
    difficulty: 'medium',
    topic: 'Trees',
  },
  {
    id: '5',
    question: 'What is the maximum number of edges in a graph with n vertices?',
    options: ['n', 'n²', 'n(n-1)/2', 'n log n'],
    correctAnswer: 2,
    explanation: 'A complete graph has n(n-1)/2 edges, where each vertex connects to every other vertex.',
    difficulty: 'hard',
    topic: 'Graphs',
  },
];

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Binary Search Tree Operations',
    content: '# BST Operations\n\n## Insert\n- Compare with root\n- If smaller, go left\n- If larger, go right\n- Repeat until null position found\n\n## Delete\n- **Case 1**: Leaf node - simply remove\n- **Case 2**: One child - replace with child\n- **Case 3**: Two children - find inorder successor, replace, delete successor',
    subject: 'Data Structures',
    topic: 'Trees',
    pinned: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Time Complexity Cheat Sheet',
    content: '| Operation | Array | Linked List | BST |\n|------------|-------|-------------|-----|\n| Search | O(n) | O(n) | O(log n) |\n| Insert | O(n) | O(1) | O(log n) |\n| Delete | O(n) | O(1) | O(log n) |',
    subject: 'Data Structures',
    topic: 'Complexity',
    pinned: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
];

export const mockFlashcards: Flashcard[] = [
  { id: '1', front: 'What is a hash table?', back: 'A data structure that maps keys to values using a hash function for O(1) average case lookup.', subject: 'Data Structures', topic: 'Hashing' },
  { id: '2', front: 'What is recursion?', back: 'A technique where a function calls itself to solve smaller subproblems until reaching a base case.', subject: 'Data Structures', topic: 'Recursion' },
  { id: '3', front: 'Difference between BFS and DFS?', back: 'BFS uses a queue and explores level by level. DFS uses a stack (or recursion) and explores depth-first.', subject: 'Data Structures', topic: 'Graphs' },
  { id: '4', front: 'What is dynamic programming?', back: 'An optimization technique that solves subproblems once and stores results to avoid redundant computation.', subject: 'Algorithms', topic: 'DP' },
];

export const mockStudySessions: StudySession[] = [
  { id: '1', date: new Date('2024-01-20'), duration: 120, topic: 'Binary Trees', subject: 'Data Structures' },
  { id: '2', date: new Date('2024-01-19'), duration: 90, topic: 'Linked Lists', subject: 'Data Structures' },
  { id: '3', date: new Date('2024-01-18'), duration: 150, topic: 'Stack Applications', subject: 'Data Structures' },
  { id: '4', date: new Date('2024-01-17'), duration: 60, topic: 'Array Operations', subject: 'Data Structures' },
  { id: '5', date: new Date('2024-01-16'), duration: 180, topic: 'Sorting Algorithms', subject: 'Data Structures' },
  { id: '6', date: new Date('2024-01-15'), duration: 100, topic: 'Graph Traversals', subject: 'Data Structures' },
];

export const mockBacklog: BacklogItem[] = [
  { id: '1', subject: 'Data Structures', topic: 'Red-Black Trees', priority: 'high' },
  { id: '2', subject: 'Data Structures', topic: 'B-Trees', priority: 'high' },
  { id: '3', subject: 'Database', topic: 'Transaction Isolation Levels', priority: 'medium' },
  { id: '4', subject: 'Operating Systems', topic: 'Page Replacement', priority: 'medium' },
  { id: '5', subject: 'Networks', topic: 'TCP Flow Control', priority: 'low' },
];

export const activityData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 2.0 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 2.8 },
];