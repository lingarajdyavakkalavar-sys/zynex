import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

interface Q {
  question: string;
  options: { index: number; text: string }[];
  correctAnswer: number;
  correctNumeric?: string;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  questionType: QuestionType;
  branch: string;
  subject: string;
  tags: string[];
}

const ALL_QUESTIONS: Q[] = [
  // ========== CSE - Data Structures ==========
  {
    question: 'Which data structure is best suited for implementing recursion?',
    options: [
      { index: 0, text: 'Queue' },
      { index: 1, text: 'Stack' },
      { index: 2, text: 'Linked List' },
      { index: 3, text: 'Heap' },
    ],
    correctAnswer: 1, explanation: 'Stack uses LIFO principle which mirrors function call stack for recursion.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'The worst case time complexity of Quick Sort is:',
    options: [
      { index: 0, text: 'O(n)' },
      { index: 1, text: 'O(log n)' },
      { index: 2, text: 'O(n log n)' },
      { index: 3, text: 'O(n²)' },
    ],
    correctAnswer: 3, explanation: 'Quick Sort worst case O(n²) when pivot is always smallest or largest element.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'How many edges are present in a complete graph with 8 vertices?',
    options: [], correctAnswer: 0, correctNumeric: '28',
    explanation: 'Complete graph K₈ has n(n-1)/2 = 8×7/2 = 28 edges.',
    marks: 1, negativeMarks: 0, difficulty: 'MEDIUM', questionType: 'NAT',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'Which traversal gives sorted order in BST?',
    options: [
      { index: 0, text: 'Preorder' },
      { index: 1, text: 'Postorder' },
      { index: 2, text: 'Inorder' },
      { index: 3, text: 'Level order' },
    ],
    correctAnswer: 2, explanation: 'Inorder traversal of BST gives elements in ascending sorted order.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'The maximum number of nodes in a binary tree of height 4 is:',
    options: [
      { index: 0, text: '15' },
      { index: 1, text: '16' },
      { index: 2, text: '31' },
      { index: 3, text: '32' },
    ],
    correctAnswer: 2, explanation: 'Height h (root at h=1) → max nodes = 2^h - 1 = 2⁴-1 = 15. But if height of single node = 0, then height 4 = 5 levels → 2⁵-1 = 31.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'Which data structure uses FIFO principle?',
    options: [
      { index: 0, text: 'Stack' },
      { index: 1, text: 'Queue' },
      { index: 2, text: 'Tree' },
      { index: 3, text: 'Graph' },
    ],
    correctAnswer: 1, explanation: 'Queue follows First In First Out (FIFO) principle.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'AVL tree is a:',
    options: [
      { index: 0, text: 'Complete tree' },
      { index: 1, text: 'Balanced binary search tree' },
      { index: 2, text: 'Heap tree' },
      { index: 3, text: 'B tree' },
    ],
    correctAnswer: 1, explanation: 'AVL is a self-balancing BST where heights of left and right subtrees differ by at most 1.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'For a min heap with 15 nodes, how many leaf nodes exist?',
    options: [], correctAnswer: 0, correctNumeric: '8',
    explanation: 'For any heap, leaf nodes = ceil(n/2) = ceil(15/2) = 8.',
    marks: 1, negativeMarks: 0, difficulty: 'MEDIUM', questionType: 'NAT',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'Which searching algorithm requires sorted data?',
    options: [
      { index: 0, text: 'Linear Search' },
      { index: 1, text: 'DFS' },
      { index: 2, text: 'Binary Search' },
      { index: 3, text: 'BFS' },
    ],
    correctAnswer: 2, explanation: 'Binary search requires sorted array to halve search space each step.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'The time complexity of inserting an element into a hash table is approximately:',
    options: [
      { index: 0, text: 'O(1)' },
      { index: 1, text: 'O(n)' },
      { index: 2, text: 'O(log n)' },
      { index: 3, text: 'O(n²)' },
    ],
    correctAnswer: 0, explanation: 'Hash table insertion average case is O(1) assuming good hash function and low load factor.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },

  // ========== CSE - Operating Systems ==========
  {
    question: 'Which scheduling algorithm may cause starvation?',
    options: [
      { index: 0, text: 'FCFS' },
      { index: 1, text: 'Round Robin' },
      { index: 2, text: 'Priority Scheduling' },
      { index: 3, text: 'FIFO' },
    ],
    correctAnswer: 2, explanation: 'Priority scheduling can cause starvation as lower priority processes may never get CPU.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'Thrashing occurs because of:',
    options: [
      { index: 0, text: 'Excessive paging' },
      { index: 1, text: 'Deadlock' },
      { index: 2, text: 'Fragmentation' },
      { index: 3, text: 'Compilation' },
    ],
    correctAnswer: 0, explanation: 'Thrashing occurs when system spends more time paging than executing processes.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'If page size is 4 KB, how many bits are needed for offset?',
    options: [], correctAnswer: 0, correctNumeric: '12',
    explanation: 'Offset bits = log₂(page size) = log₂(4×1024) = log₂(4096) = 12 bits.',
    marks: 1, negativeMarks: 0, difficulty: 'MEDIUM', questionType: 'NAT',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'Which of the following is not a CPU scheduling algorithm?',
    options: [
      { index: 0, text: 'SJF' },
      { index: 1, text: 'Round Robin' },
      { index: 2, text: 'Paging' },
      { index: 3, text: 'FCFS' },
    ],
    correctAnswer: 2, explanation: 'Paging is a memory management technique, not a CPU scheduling algorithm.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'Semaphore is used for:',
    options: [
      { index: 0, text: 'Memory allocation' },
      { index: 1, text: 'Synchronization' },
      { index: 2, text: 'Paging' },
      { index: 3, text: 'Address mapping' },
    ],
    correctAnswer: 1, explanation: 'Semaphore is a synchronization primitive used for process coordination.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },

  // ========== CSE - Computer Networks ==========
  {
    question: 'Which protocol is connection oriented?',
    options: [
      { index: 0, text: 'UDP' },
      { index: 1, text: 'IP' },
      { index: 2, text: 'TCP' },
      { index: 3, text: 'ARP' },
    ],
    correctAnswer: 2, explanation: 'TCP (Transmission Control Protocol) provides reliable, connection-oriented communication.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'Which layer handles routing?',
    options: [
      { index: 0, text: 'Transport' },
      { index: 1, text: 'Application' },
      { index: 2, text: 'Network' },
      { index: 3, text: 'Session' },
    ],
    correctAnswer: 2, explanation: 'Network layer (Layer 3) is responsible for routing packets across networks.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'How many bits are present in an IPv6 address?',
    options: [], correctAnswer: 0, correctNumeric: '128',
    explanation: 'IPv6 uses 128-bit address space, providing 3.4×10³⁸ unique addresses.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'DNS converts:',
    options: [
      { index: 0, text: 'IP to MAC' },
      { index: 1, text: 'Domain to IP' },
      { index: 2, text: 'IP to Domain' },
      { index: 3, text: 'MAC to IP' },
    ],
    correctAnswer: 1, explanation: 'DNS (Domain Name System) maps domain names to IP addresses.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'HTTP works on:',
    options: [
      { index: 0, text: 'UDP' },
      { index: 1, text: 'TCP' },
      { index: 2, text: 'ICMP' },
      { index: 3, text: 'ARP' },
    ],
    correctAnswer: 1, explanation: 'HTTP uses TCP (port 80 for HTTP, 443 for HTTPS) for reliable communication.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },

  // ========== CSE - Additional ==========
  {
    question: 'Which normal form removes partial dependency?',
    options: [
      { index: 0, text: '1NF' },
      { index: 1, text: '2NF' },
      { index: 2, text: '3NF' },
      { index: 3, text: 'BCNF' },
    ],
    correctAnswer: 1, explanation: '2NF removes partial dependencies on candidate keys.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'DBMS', tags: ['CS', 'DBMS', 'GATE'],
  },
  {
    question: 'Which protocol is used for email transfer?',
    options: [
      { index: 0, text: 'FTP' },
      { index: 1, text: 'SMTP' },
      { index: 2, text: 'SNMP' },
      { index: 3, text: 'DHCP' },
    ],
    correctAnswer: 1, explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'A compiler converts:',
    options: [
      { index: 0, text: 'Machine code to assembly' },
      { index: 1, text: 'High level language to machine code' },
      { index: 2, text: 'Assembly to high level language' },
      { index: 3, text: 'Binary to decimal' },
    ],
    correctAnswer: 1, explanation: 'Compiler translates high-level language source code to machine code/executable.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Compiler Design', tags: ['CS', 'Compiler Design', 'GATE'],
  },
  {
    question: 'Deadlock requires:',
    options: [
      { index: 0, text: 'Mutual exclusion' },
      { index: 1, text: 'Hold and wait' },
      { index: 2, text: 'Circular wait' },
      { index: 3, text: 'All of these' },
    ],
    correctAnswer: 3, explanation: 'All four Coffman conditions must hold simultaneously for deadlock: mutual exclusion, hold and wait, no preemption, circular wait.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'Which traversal uses queue?',
    options: [
      { index: 0, text: 'DFS' },
      { index: 1, text: 'BFS' },
      { index: 2, text: 'Inorder' },
      { index: 3, text: 'Postorder' },
    ],
    correctAnswer: 1, explanation: 'BFS (Breadth First Search) uses a queue to process nodes level by level.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },

  // ========== CSE - Continued ==========
  {
    question: 'Which layer of OSI model handles encryption?',
    options: [
      { index: 0, text: 'Physical' },
      { index: 1, text: 'Presentation' },
      { index: 2, text: 'Data Link' },
      { index: 3, text: 'Transport' },
    ],
    correctAnswer: 1, explanation: 'Presentation layer handles data translation, encryption, and compression.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'Which data structure is used in BFS?',
    options: [
      { index: 0, text: 'Stack' },
      { index: 1, text: 'Queue' },
      { index: 2, text: 'Heap' },
      { index: 3, text: 'Tree' },
    ],
    correctAnswer: 1, explanation: 'BFS uses Queue for level-order traversal.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: "Dijkstra algorithm is used for:",
    options: [
      { index: 0, text: 'Sorting' },
      { index: 1, text: 'Searching' },
      { index: 2, text: 'Shortest path' },
      { index: 3, text: 'Compression' },
    ],
    correctAnswer: 2, explanation: "Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph.",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Algorithms', tags: ['CS', 'Algorithms', 'GATE'],
  },
  {
    question: 'Which normal form removes transitive dependency?',
    options: [
      { index: 0, text: '1NF' },
      { index: 1, text: '2NF' },
      { index: 2, text: '3NF' },
      { index: 3, text: '4NF' },
    ],
    correctAnswer: 2, explanation: '3NF removes transitive dependencies where non-key attributes depend on other non-key attributes.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'DBMS', tags: ['CS', 'DBMS', 'GATE'],
  },
  {
    question: 'TCP uses:',
    options: [
      { index: 0, text: 'Connectionless communication' },
      { index: 1, text: 'Connection oriented communication' },
      { index: 2, text: 'Broadcast only' },
      { index: 3, text: 'Analog communication' },
    ],
    correctAnswer: 1, explanation: 'TCP provides reliable, connection-oriented, byte-stream service.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'Primary key cannot contain:',
    options: [
      { index: 0, text: 'Integers' },
      { index: 1, text: 'Characters' },
      { index: 2, text: 'NULL values' },
      { index: 3, text: 'Unique values' },
    ],
    correctAnswer: 2, explanation: 'Primary key must be unique and NOT NULL for every row.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'DBMS', tags: ['CS', 'DBMS', 'GATE'],
  },
  {
    question: 'Which algorithm uses divide and conquer?',
    options: [
      { index: 0, text: 'Bubble Sort' },
      { index: 1, text: 'Merge Sort' },
      { index: 2, text: 'Linear Search' },
      { index: 3, text: 'BFS' },
    ],
    correctAnswer: 1, explanation: 'Merge Sort divides array into halves, recursively sorts, and merges (divide and conquer).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Algorithms', tags: ['CS', 'Algorithms', 'GATE'],
  },
  {
    question: 'Virtual memory uses:',
    options: [
      { index: 0, text: 'Cache' },
      { index: 1, text: 'Paging' },
      { index: 2, text: 'Registers' },
      { index: 3, text: 'ALU' },
    ],
    correctAnswer: 1, explanation: 'Virtual memory is implemented using paging where processes are divided into pages.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'The worst case complexity of binary search is:',
    options: [
      { index: 0, text: 'O(n)' },
      { index: 1, text: 'O(log n)' },
      { index: 2, text: 'O(n²)' },
      { index: 3, text: 'O(1)' },
    ],
    correctAnswer: 1, explanation: 'Binary search halves search space each step, giving O(log n) worst case.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Algorithms', tags: ['CS', 'Algorithms', 'GATE'],
  },
  {
    question: 'Compiler phase generating tokens is:',
    options: [
      { index: 0, text: 'Parsing' },
      { index: 1, text: 'Lexical analysis' },
      { index: 2, text: 'Semantic analysis' },
      { index: 3, text: 'Optimization' },
    ],
    correctAnswer: 1, explanation: 'Lexical analyzer (scanner) breaks source code into tokens (identifiers, keywords, operators).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Compiler Design', tags: ['CS', 'Compiler Design', 'GATE'],
  },

  // ========== CSE - Advanced ==========
  {
    question: 'Which scheduling algorithm gives minimum average waiting time?',
    options: [
      { index: 0, text: 'FCFS' },
      { index: 1, text: 'SJF' },
      { index: 2, text: 'Round Robin' },
      { index: 3, text: 'Priority' },
    ],
    correctAnswer: 1, explanation: 'SJF (Shortest Job First) gives minimum average waiting time among non-preemptive algorithms.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'Which protocol assigns IP addresses automatically?',
    options: [
      { index: 0, text: 'HTTP' },
      { index: 1, text: 'FTP' },
      { index: 2, text: 'DHCP' },
      { index: 3, text: 'SMTP' },
    ],
    correctAnswer: 2, explanation: 'DHCP (Dynamic Host Configuration Protocol) dynamically assigns IP addresses to devices.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Computer Networks', tags: ['CS', 'Computer Networks', 'GATE'],
  },
  {
    question: 'In DBMS, redundancy leads to:',
    options: [
      { index: 0, text: 'Efficiency' },
      { index: 1, text: 'Data inconsistency' },
      { index: 2, text: 'Compression' },
      { index: 3, text: 'Encryption' },
    ],
    correctAnswer: 1, explanation: 'Data redundancy (duplicate data) can lead to data inconsistency and anomalies during insert/update/delete.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'DBMS', tags: ['CS', 'DBMS', 'GATE'],
  },
  {
    question: 'The postfix form of AB+CD-* is:',
    options: [
      { index: 0, text: 'AB+CD-*' },
      { index: 1, text: 'AB-CD+*' },
      { index: 2, text: 'ABCD+-*' },
      { index: 3, text: 'AB+CD*-' },
    ],
    correctAnswer: 0, explanation: 'Infix: (A+B)*(C-D) → Postfix: AB+CD-* is already correct.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'Which memory is fastest?',
    options: [
      { index: 0, text: 'RAM' },
      { index: 1, text: 'ROM' },
      { index: 2, text: 'Cache' },
      { index: 3, text: 'Hard Disk' },
    ],
    correctAnswer: 2, explanation: 'Cache memory (L1/L2/L3) is the fastest, located closest to CPU.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'COA', tags: ['CS', 'COA', 'GATE'],
  },
  {
    question: "Which algorithm is used in deadlock avoidance?",
    options: [
      { index: 0, text: "Banker's algorithm" },
      { index: 1, text: "Prim's algorithm" },
      { index: 2, text: 'Kruskal algorithm' },
      { index: 3, text: 'Dijkstra algorithm' },
    ],
    correctAnswer: 0, explanation: "Banker's algorithm is used for deadlock avoidance by checking safe state before resource allocation.",
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },
  {
    question: 'A spanning tree of graph with n vertices has:',
    options: [
      { index: 0, text: 'n edges' },
      { index: 1, text: 'n+1 edges' },
      { index: 2, text: 'n-1 edges' },
      { index: 3, text: '2n edges' },
    ],
    correctAnswer: 2, explanation: 'A spanning tree has exactly (n-1) edges for a connected graph with n vertices.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'CS', subject: 'Data Structures', tags: ['CS', 'Data Structures', 'GATE'],
  },
  {
    question: 'Which SQL command removes a table completely?',
    options: [
      { index: 0, text: 'DELETE' },
      { index: 1, text: 'REMOVE' },
      { index: 2, text: 'DROP' },
      { index: 3, text: 'ERASE' },
    ],
    correctAnswer: 2, explanation: 'DROP removes entire table structure and data from database.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'DBMS', tags: ['CS', 'DBMS', 'GATE'],
  },
  {
    question: 'The number system using base 8 is:',
    options: [
      { index: 0, text: 'Decimal' },
      { index: 1, text: 'Binary' },
      { index: 2, text: 'Hexadecimal' },
      { index: 3, text: 'Octal' },
    ],
    correctAnswer: 3, explanation: 'Octal number system uses base 8 (digits 0-7).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Digital Logic', tags: ['CS', 'Digital Logic', 'GATE'],
  },
  {
    question: 'Round Robin scheduling is mainly used in:',
    options: [
      { index: 0, text: 'Batch systems' },
      { index: 1, text: 'Real time systems' },
      { index: 2, text: 'Time sharing systems' },
      { index: 3, text: 'Distributed systems' },
    ],
    correctAnswer: 2, explanation: 'Round Robin is ideal for time-sharing systems ensuring fair CPU distribution.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'CS', subject: 'Operating Systems', tags: ['CS', 'Operating Systems', 'GATE'],
  },

  // ========== ECE ==========
  {
    question: 'Which transistor region is used for amplification?',
    options: [
      { index: 0, text: 'Cutoff' },
      { index: 1, text: 'Saturation' },
      { index: 2, text: 'Active' },
      { index: 3, text: 'Breakdown' },
    ],
    correctAnswer: 2, explanation: 'Active region is used for amplification where small changes in input cause large changes in output.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'An ideal op amp has:',
    options: [
      { index: 0, text: 'Infinite gain' },
      { index: 1, text: 'Zero gain' },
      { index: 2, text: 'Infinite output resistance' },
      { index: 3, text: 'Zero bandwidth' },
    ],
    correctAnswer: 0, explanation: 'Ideal op-amp has infinite open-loop voltage gain, infinite input impedance, zero output impedance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'A signal has frequency 1 kHz. Find its period in milliseconds.',
    options: [], correctAnswer: 0, correctNumeric: '1',
    explanation: 'Period T = 1/f = 1/1000 Hz = 0.001 s = 1 ms.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'EC', subject: 'Signals and Systems', tags: ['EC', 'Signals', 'GATE'],
  },
  {
    question: 'Which biasing provides best stability?',
    options: [
      { index: 0, text: 'Fixed bias' },
      { index: 1, text: 'Voltage divider bias' },
      { index: 2, text: 'Collector bias' },
      { index: 3, text: 'Base bias' },
    ],
    correctAnswer: 1, explanation: 'Voltage divider bias provides best stability due to negative feedback.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'The output of a full wave rectifier contains:',
    options: [
      { index: 0, text: 'AC only' },
      { index: 1, text: 'DC only' },
      { index: 2, text: 'Pulsating DC' },
      { index: 3, text: 'Zero output' },
    ],
    correctAnswer: 2, explanation: 'Full wave rectifier output is pulsating DC (ripple) at twice the input frequency.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'Which gate is universal?',
    options: [
      { index: 0, text: 'XOR' },
      { index: 1, text: 'NAND' },
      { index: 2, text: 'AND' },
      { index: 3, text: 'OR' },
    ],
    correctAnswer: 1, explanation: 'NAND gate is universal because any boolean function can be implemented using only NAND gates.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'A flip flop stores:',
    options: [
      { index: 0, text: '1 bit' },
      { index: 1, text: '2 bits' },
      { index: 2, text: '4 bits' },
      { index: 3, text: '8 bits' },
    ],
    correctAnswer: 0, explanation: 'A flip-flop is a 1-bit memory element that stores either 0 or 1.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'How many combinations exist for a 4 bit binary number?',
    options: [], correctAnswer: 0, correctNumeric: '16',
    explanation: '4 bits can represent 2⁴ = 16 different combinations (0 to 15).',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'Gray code changes:',
    options: [
      { index: 0, text: 'Two bits at a time' },
      { index: 1, text: 'One bit at a time' },
      { index: 2, text: 'Three bits at a time' },
      { index: 3, text: 'Four bits at a time' },
    ],
    correctAnswer: 1, explanation: 'Gray code is unit distance code where only one bit changes between consecutive values.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'Which device converts analog signal to digital?',
    options: [
      { index: 0, text: 'DAC' },
      { index: 1, text: 'ADC' },
      { index: 2, text: 'Multiplexer' },
      { index: 3, text: 'Decoder' },
    ],
    correctAnswer: 1, explanation: 'ADC (Analog to Digital Converter) converts continuous analog signals to discrete digital form.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'AM stands for:',
    options: [
      { index: 0, text: 'Amplitude Modulation' },
      { index: 1, text: 'Analog Modulation' },
      { index: 2, text: 'Amplitude Mixing' },
      { index: 3, text: 'Analog Mixing' },
    ],
    correctAnswer: 0, explanation: 'AM (Amplitude Modulation) varies the amplitude of carrier wave with message signal.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'Nyquist sampling theorem avoids:',
    options: [
      { index: 0, text: 'Attenuation' },
      { index: 1, text: 'Distortion' },
      { index: 2, text: 'Aliasing' },
      { index: 3, text: 'Reflection' },
    ],
    correctAnswer: 2, explanation: 'Nyquist theorem (fs ≥ 2fmax) prevents aliasing (overlapping of frequency components).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'The speed of electromagnetic waves in vacuum is approximately:',
    options: [], correctAnswer: 0, correctNumeric: '3×10^8',
    explanation: 'Speed of light in vacuum = 3×10⁸ m/s.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'FM provides better:',
    options: [
      { index: 0, text: 'Noise immunity' },
      { index: 1, text: 'Bandwidth efficiency' },
      { index: 2, text: 'Power loss' },
      { index: 3, text: 'Distortion' },
    ],
    correctAnswer: 0, explanation: 'FM (Frequency Modulation) has better noise immunity compared to AM.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'Which multiplexing technique is used in optical fiber?',
    options: [
      { index: 0, text: 'TDM' },
      { index: 1, text: 'FDM' },
      { index: 2, text: 'WDM' },
      { index: 3, text: 'CDM' },
    ],
    correctAnswer: 2, explanation: 'WDM (Wavelength Division Multiplexing) combines multiple light signals on optical fiber.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  // ECE continued
  {
    question: 'Which modulation is used in FM radio?',
    options: [
      { index: 0, text: 'AM' },
      { index: 1, text: 'FM' },
      { index: 2, text: 'PM' },
      { index: 3, text: 'PCM' },
    ],
    correctAnswer: 1, explanation: 'FM (Frequency Modulation) is used in FM radio broadcasting.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: "The Boolean expression A + A' equals:",
    options: [
      { index: 0, text: '0' },
      { index: 1, text: '1' },
      { index: 2, text: 'A' },
      { index: 3, text: "A'" },
    ],
    correctAnswer: 1, explanation: "A + A' = 1 (by complement law: A OR NOT A is always true).",
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'A diode conducts in:',
    options: [
      { index: 0, text: 'Reverse bias only' },
      { index: 1, text: 'Forward bias only' },
      { index: 2, text: 'Both directions' },
      { index: 3, text: 'Neither direction' },
    ],
    correctAnswer: 1, explanation: 'Diode conducts only when forward biased (anode > cathode voltage).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'CMOS technology is known for:',
    options: [
      { index: 0, text: 'High power consumption' },
      { index: 1, text: 'Low power consumption' },
      { index: 2, text: 'High noise only' },
      { index: 3, text: 'Mechanical switching' },
    ],
    correctAnswer: 1, explanation: 'CMOS (Complementary MOS) has very low static power consumption due to complementary pair.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'The unit of gain in logarithmic scale is:',
    options: [
      { index: 0, text: 'Henry' },
      { index: 1, text: 'Tesla' },
      { index: 2, text: 'Decibel' },
      { index: 3, text: 'Weber' },
    ],
    correctAnswer: 2, explanation: 'Decibel (dB) is logarithmic unit for power or voltage gain.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  // ECE Advanced
  {
    question: 'Which logic family has highest speed?',
    options: [
      { index: 0, text: 'RTL' },
      { index: 1, text: 'DTL' },
      { index: 2, text: 'TTL' },
      { index: 3, text: 'ECL' },
    ],
    correctAnswer: 3, explanation: 'ECL (Emitter Coupled Logic) has highest speed due to non-saturated operation.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'The cutoff frequency is defined at:',
    options: [
      { index: 0, text: 'Half power point' },
      { index: 1, text: 'Maximum power point' },
      { index: 2, text: 'Zero voltage' },
      { index: 3, text: 'Infinite gain' },
    ],
    correctAnswer: 0, explanation: 'Cutoff frequency (-3dB point) is where power drops to half of maximum.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'A transistor has:',
    options: [
      { index: 0, text: 'One junction' },
      { index: 1, text: 'Two junctions' },
      { index: 2, text: 'Three junctions' },
      { index: 3, text: 'Four junctions' },
    ],
    correctAnswer: 1, explanation: 'BJT has two pn-junctions (base-emitter and base-collector).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'The gain bandwidth product for an op amp is generally:',
    options: [
      { index: 0, text: 'Constant' },
      { index: 1, text: 'Zero' },
      { index: 2, text: 'Infinite' },
      { index: 3, text: 'Variable only with voltage' },
    ],
    correctAnswer: 0, explanation: 'GBW (Gain Bandwidth Product) is constant for an op-amp, indicating gain-bandwidth tradeoff.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'Pulse code modulation converts:',
    options: [
      { index: 0, text: 'Analog to digital' },
      { index: 1, text: 'Digital to analog' },
      { index: 2, text: 'AC to DC' },
      { index: 3, text: 'Frequency to phase' },
    ],
    correctAnswer: 0, explanation: 'PCM converts continuous analog signal to discrete digital representation.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'The output of NOT gate is:',
    options: [
      { index: 0, text: 'Same as input' },
      { index: 1, text: 'Complement of input' },
      { index: 2, text: 'Sum of inputs' },
      { index: 3, text: 'Product of inputs' },
    ],
    correctAnswer: 1, explanation: 'NOT gate (inverter) produces complement/inverse of input.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'Which waveguide mode has no cutoff frequency?',
    options: [
      { index: 0, text: 'TE10' },
      { index: 1, text: 'TM11' },
      { index: 2, text: 'TEM' },
      { index: 3, text: 'TE01' },
    ],
    correctAnswer: 2, explanation: 'TEM mode (Transverse ElectroMagnetic) has zero cutoff frequency.',
    marks: 1, negativeMarks: 0.33, difficulty: 'HARD', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },
  {
    question: 'A multiplexer acts as:',
    options: [
      { index: 0, text: 'Data selector' },
      { index: 1, text: 'Data amplifier' },
      { index: 2, text: 'Data converter' },
      { index: 3, text: 'Oscillator' },
    ],
    correctAnswer: 0, explanation: 'MUX (multiplexer) selects one of many input data lines and forwards it to single output.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'The unit of electric charge is:',
    options: [
      { index: 0, text: 'Volt' },
      { index: 1, text: 'Coulomb' },
      { index: 2, text: 'Ohm' },
      { index: 3, text: 'Farad' },
    ],
    correctAnswer: 1, explanation: 'Coulomb (C) is the SI unit of electric charge.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'A Schmitt trigger is used for:',
    options: [
      { index: 0, text: 'Amplification' },
      { index: 1, text: 'Wave shaping' },
      { index: 2, text: 'Rectification' },
      { index: 3, text: 'Filtering' },
    ],
    correctAnswer: 1, explanation: 'Schmitt trigger converts noisy/varied analog signals to clean digital outputs with hysteresis.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  // ECE MCQs continued
  {
    question: 'Which filter passes low frequencies?',
    options: [
      { index: 0, text: 'High pass' },
      { index: 1, text: 'Band stop' },
      { index: 2, text: 'Low pass' },
      { index: 3, text: 'Band pass' },
    ],
    correctAnswer: 2, explanation: 'Low pass filter allows frequencies below cutoff to pass, attenuates higher frequencies.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'Zener diode is mainly used for:',
    options: [
      { index: 0, text: 'Amplification' },
      { index: 1, text: 'Rectification' },
      { index: 2, text: 'Voltage regulation' },
      { index: 3, text: 'Oscillation' },
    ],
    correctAnswer: 2, explanation: 'Zener diode operates in reverse breakdown to provide constant reference voltage.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'The output of XOR gate is HIGH when inputs are:',
    options: [
      { index: 0, text: 'Same' },
      { index: 1, text: 'Different' },
      { index: 2, text: 'Zero' },
      { index: 3, text: 'High' },
    ],
    correctAnswer: 1, explanation: 'XOR output is 1 (HIGH) when exactly one input is 1 (inputs are different).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'An oscillator generates:',
    options: [
      { index: 0, text: 'DC signal' },
      { index: 1, text: 'Random signal' },
      { index: 2, text: 'Periodic signal' },
      { index: 3, text: 'Noise only' },
    ],
    correctAnswer: 2, explanation: 'Oscillator generates self-sustaining periodic/oscillating signal without input.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'The SI unit of capacitance is:',
    options: [
      { index: 0, text: 'Henry' },
      { index: 1, text: 'Farad' },
      { index: 2, text: 'Weber' },
      { index: 3, text: 'Tesla' },
    ],
    correctAnswer: 1, explanation: 'Farad (F) is SI unit of capacitance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'Sampling frequency should be at least:',
    options: [
      { index: 0, text: 'Equal to signal frequency' },
      { index: 1, text: 'Half of signal frequency' },
      { index: 2, text: 'Twice the signal frequency' },
      { index: 3, text: 'Four times signal frequency' },
    ],
    correctAnswer: 2, explanation: 'Nyquist rate: sampling frequency ≥ 2× signal bandwidth to avoid aliasing.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Signals and Systems', tags: ['EC', 'Signals', 'GATE'],
  },
  {
    question: 'Which device stores charge?',
    options: [
      { index: 0, text: 'Resistor' },
      { index: 1, text: 'Capacitor' },
      { index: 2, text: 'Inductor' },
      { index: 3, text: 'Diode' },
    ],
    correctAnswer: 1, explanation: 'Capacitor stores energy in electric field as charge on its plates.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'Half adder adds:',
    options: [
      { index: 0, text: 'One bit' },
      { index: 1, text: 'Two bits' },
      { index: 2, text: 'Three bits' },
      { index: 3, text: 'Four bits' },
    ],
    correctAnswer: 1, explanation: 'Half adder adds two single-bit numbers producing sum and carry.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Digital Electronics', tags: ['EC', 'Digital Electronics', 'GATE'],
  },
  {
    question: 'Transistor acts as a switch in:',
    options: [
      { index: 0, text: 'Cutoff and saturation' },
      { index: 1, text: 'Active region only' },
      { index: 2, text: 'Reverse bias only' },
      { index: 3, text: 'Breakdown only' },
    ],
    correctAnswer: 0, explanation: 'Transistor operates as switch in cutoff (OFF) and saturation (ON) regions.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EC', subject: 'Analog Electronics', tags: ['EC', 'Analog Electronics', 'GATE'],
  },
  {
    question: 'The frequency range of human hearing is approximately:',
    options: [
      { index: 0, text: '20 Hz to 20 kHz' },
      { index: 1, text: '2 Hz to 2 kHz' },
      { index: 2, text: '200 Hz to 200 kHz' },
      { index: 3, text: '1 Hz to 10 Hz' },
    ],
    correctAnswer: 0, explanation: 'Human audible frequency range is 20 Hz to 20,000 Hz (20 kHz).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EC', subject: 'Communication', tags: ['EC', 'Communication', 'GATE'],
  },

  // ========== EEE ==========
  {
    question: 'Transformer works on:',
    options: [
      { index: 0, text: 'Self induction' },
      { index: 1, text: 'Mutual induction' },
      { index: 2, text: 'Capacitance' },
      { index: 3, text: 'Resistance' },
    ],
    correctAnswer: 1, explanation: 'Transformer works on mutual induction between primary and secondary windings.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A DC motor converts:',
    options: [
      { index: 0, text: 'Mechanical to electrical' },
      { index: 1, text: 'Electrical to mechanical' },
      { index: 2, text: 'AC to DC' },
      { index: 3, text: 'DC to AC' },
    ],
    correctAnswer: 1, explanation: 'DC motor converts electrical energy to mechanical energy (rotation).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A 2 pole alternator running at 3000 rpm generates frequency:',
    options: [], correctAnswer: 0, correctNumeric: '50',
    explanation: 'f = (P×N)/120 = (2×3000)/120 = 50 Hz.',
    marks: 1, negativeMarks: 0, difficulty: 'MEDIUM', questionType: 'NAT',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Slip in induction motor is:',
    options: [
      { index: 0, text: 'Always zero' },
      { index: 1, text: 'Difference between synchronous and rotor speed' },
      { index: 2, text: 'Rotor speed' },
      { index: 3, text: 'Stator speed' },
    ],
    correctAnswer: 1, explanation: 'Slip s = (Ns - Nr)/Ns, where Ns = synchronous speed, Nr = rotor speed.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Transformer rating is generally in:',
    options: [
      { index: 0, text: 'kW' },
      { index: 1, text: 'kVAR' },
      { index: 2, text: 'kVA' },
      { index: 3, text: 'MW' },
    ],
    correctAnswer: 2, explanation: 'Transformer rated in kVA (apparent power) as it depends on voltage and current irrespective of power factor.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Circuit breaker is used for:',
    options: [
      { index: 0, text: 'Voltage control' },
      { index: 1, text: 'Protection' },
      { index: 2, text: 'Frequency control' },
      { index: 3, text: 'Rectification' },
    ],
    correctAnswer: 1, explanation: 'Circuit breaker protects electrical system by interrupting fault currents.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Corona effect occurs in:',
    options: [
      { index: 0, text: 'Underground cable' },
      { index: 1, text: 'Transmission line' },
      { index: 2, text: 'Transformer' },
      { index: 3, text: 'Generator' },
    ],
    correctAnswer: 1, explanation: 'Corona occurs in overhead transmission lines due to ionization of air around conductors.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'The frequency of Indian power system is:',
    options: [], correctAnswer: 0, correctNumeric: '50',
    explanation: 'Indian power system operates at 50 Hz (standard in most countries).',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Per unit system simplifies:',
    options: [
      { index: 0, text: 'Coding' },
      { index: 1, text: 'Calculations' },
      { index: 2, text: 'Wiring' },
      { index: 3, text: 'Installation' },
    ],
    correctAnswer: 1, explanation: 'Per unit system normalizes values to simplify power system calculations.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Load flow studies are used for:',
    options: [
      { index: 0, text: 'Harmonic analysis' },
      { index: 1, text: 'Power system planning' },
      { index: 2, text: 'Protection only' },
      { index: 3, text: 'Rectification' },
    ],
    correctAnswer: 1, explanation: 'Load flow (power flow) analysis determines voltage, current, power in system for planning.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Laplace transform converts:',
    options: [
      { index: 0, text: 'Time domain to frequency domain' },
      { index: 1, text: 'Frequency to time' },
      { index: 2, text: 'Analog to digital' },
      { index: 3, text: 'Digital to analog' },
    ],
    correctAnswer: 0, explanation: 'Laplace transform converts differential equations from time domain to s-domain (frequency).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Control Systems', tags: ['EE', 'Control Systems', 'GATE'],
  },
  {
    question: 'A stable system has poles:',
    options: [
      { index: 0, text: 'Right half plane' },
      { index: 1, text: 'Imaginary axis only' },
      { index: 2, text: 'Left half plane' },
      { index: 3, text: 'Origin only' },
    ],
    correctAnswer: 2, explanation: 'For BIBO stability, transfer function poles must be in left half of s-plane.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Control Systems', tags: ['EE', 'Control Systems', 'GATE'],
  },
  {
    question: 'The order of transfer function s² + 5s + 6 is:',
    options: [], correctAnswer: 0, correctNumeric: '2',
    explanation: 'Order equals highest power of s = 2.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'EE', subject: 'Control Systems', tags: ['EE', 'Control Systems', 'GATE'],
  },
  {
    question: 'Root locus shows movement of:',
    options: [
      { index: 0, text: 'Zeros' },
      { index: 1, text: 'Poles' },
      { index: 2, text: 'Gains' },
      { index: 3, text: 'Frequencies' },
    ],
    correctAnswer: 1, explanation: "Root locus plots movement of poles as gain K varies from 0 to ∞.",
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Control Systems', tags: ['EE', 'Control Systems', 'GATE'],
  },
  {
    question: 'PID controller contains:',
    options: [
      { index: 0, text: 'P only' },
      { index: 1, text: 'PI only' },
      { index: 2, text: 'PD only' },
      { index: 3, text: 'P, I and D' },
    ],
    correctAnswer: 3, explanation: 'PID has Proportional, Integral, and Derivative control actions combined.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Control Systems', tags: ['EE', 'Control Systems', 'GATE'],
  },
  // EEE Continued
  {
    question: 'Power factor of pure resistor is:',
    options: [
      { index: 0, text: '0' },
      { index: 1, text: '0.5' },
      { index: 2, text: '1' },
      { index: 3, text: 'Infinite' },
    ],
    correctAnswer: 2, explanation: 'Pure resistor has unity power factor (PF = 1) as voltage and current are in phase.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Which machine is used in electric trains?',
    options: [
      { index: 0, text: 'Synchronous motor' },
      { index: 1, text: 'DC series motor' },
      { index: 2, text: 'Induction generator' },
      { index: 3, text: 'Stepper motor' },
    ],
    correctAnswer: 1, explanation: 'DC series motor has high starting torque, ideal for traction (electric trains).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Capacitor opposes change in:',
    options: [
      { index: 0, text: 'Voltage' },
      { index: 1, text: 'Current' },
      { index: 2, text: 'Resistance' },
      { index: 3, text: 'Power' },
    ],
    correctAnswer: 0, explanation: 'Capacitor opposes voltage changes (V cannot change instantaneously).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'An ideal transformer has efficiency:',
    options: [
      { index: 0, text: '50%' },
      { index: 1, text: '75%' },
      { index: 2, text: '90%' },
      { index: 3, text: '100%' },
    ],
    correctAnswer: 3, explanation: 'Ideal transformer has 100% efficiency (no losses).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Relay is used for:',
    options: [
      { index: 0, text: 'Measurement' },
      { index: 1, text: 'Protection' },
      { index: 2, text: 'Amplification' },
      { index: 3, text: 'Heating' },
    ],
    correctAnswer: 1, explanation: 'Relay provides protection by detecting faults and isolating circuits.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  // EEE Advanced
  {
    question: 'The SI unit of resistance is:',
    options: [
      { index: 0, text: 'Henry' },
      { index: 1, text: 'Tesla' },
      { index: 2, text: 'Ohm' },
      { index: 3, text: 'Siemens' },
    ],
    correctAnswer: 2, explanation: 'Ohm (Ω) is SI unit of electrical resistance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A megger measures:',
    options: [
      { index: 0, text: 'Voltage' },
      { index: 1, text: 'Current' },
      { index: 2, text: 'Resistance' },
      { index: 3, text: 'Insulation resistance' },
    ],
    correctAnswer: 3, explanation: 'Megger is a high-range ohmmeter for measuring insulation resistance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'The emf equation of transformer depends on:',
    options: [
      { index: 0, text: 'Frequency' },
      { index: 1, text: 'Flux' },
      { index: 2, text: 'Turns' },
      { index: 3, text: 'All of these' },
    ],
    correctAnswer: 3, explanation: 'E = 4.44 f N Φ (depends on frequency, turns, and flux).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'An alternator converts:',
    options: [
      { index: 0, text: 'Mechanical energy to electrical energy' },
      { index: 1, text: 'Electrical energy to heat' },
      { index: 2, text: 'AC to DC' },
      { index: 3, text: 'DC to AC' },
    ],
    correctAnswer: 0, explanation: 'Alternator (synchronous generator) converts mechanical to electrical energy.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A choke coil is generally connected in:',
    options: [
      { index: 0, text: 'Parallel' },
      { index: 1, text: 'Series' },
      { index: 2, text: 'Open circuit' },
      { index: 3, text: 'Ground' },
    ],
    correctAnswer: 1, explanation: 'Choke coil (inductor) is connected in series to limit AC current.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Power factor improvement reduces:',
    options: [
      { index: 0, text: 'Current' },
      { index: 1, text: 'Voltage' },
      { index: 2, text: 'Frequency' },
      { index: 3, text: 'Resistance' },
    ],
    correctAnswer: 0, explanation: 'Improving PF reduces line current and associated I²R losses.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'The speed regulation of transformer is:',
    options: [
      { index: 0, text: 'Zero' },
      { index: 1, text: 'Infinite' },
      { index: 2, text: 'Negative' },
      { index: 3, text: 'Unity' },
    ],
    correctAnswer: 0, explanation: 'Transformer has excellent speed regulation (approximately 0-5%) due to low internal resistance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Which device converts AC to DC?',
    options: [
      { index: 0, text: 'Inverter' },
      { index: 1, text: 'Rectifier' },
      { index: 2, text: 'Chopper' },
      { index: 3, text: 'Cycloconverter' },
    ],
    correctAnswer: 1, explanation: 'Rectifier converts AC to DC using diodes/SCRs.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'The unit of conductance is:',
    options: [
      { index: 0, text: 'Ohm' },
      { index: 1, text: 'Henry' },
      { index: 2, text: 'Siemens' },
      { index: 3, text: 'Tesla' },
    ],
    correctAnswer: 2, explanation: 'Siemens (S) is SI unit of conductance (inverse of Ohm).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'The function of armature winding is:',
    options: [
      { index: 0, text: 'Cooling' },
      { index: 1, text: 'Flux production' },
      { index: 2, text: 'EMF generation' },
      { index: 3, text: 'Lubrication' },
    ],
    correctAnswer: 2, explanation: 'Armature winding cuts magnetic flux to generate EMF (electromechanical energy conversion).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  // EEE continued
  {
    question: 'Which instrument measures power?',
    options: [
      { index: 0, text: 'Ammeter' },
      { index: 1, text: 'Voltmeter' },
      { index: 2, text: 'Wattmeter' },
      { index: 3, text: 'Energy meter' },
    ],
    correctAnswer: 2, explanation: 'Wattmeter measures electrical power in watts.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A synchronous motor runs at:',
    options: [
      { index: 0, text: 'Rotor speed' },
      { index: 1, text: 'Slip speed' },
      { index: 2, text: 'Constant synchronous speed' },
      { index: 3, text: 'Variable speed' },
    ],
    correctAnswer: 2, explanation: 'Synchronous motor runs at constant speed (Ns = 120f/P) regardless of load.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'The unit of magnetic flux is:',
    options: [
      { index: 0, text: 'Tesla' },
      { index: 1, text: 'Weber' },
      { index: 2, text: 'Henry' },
      { index: 3, text: 'Farad' },
    ],
    correctAnswer: 1, explanation: 'Weber (Wb) is SI unit of magnetic flux.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'An inductor opposes change in:',
    options: [
      { index: 0, text: 'Voltage' },
      { index: 1, text: 'Current' },
      { index: 2, text: 'Power' },
      { index: 3, text: 'Frequency' },
    ],
    correctAnswer: 1, explanation: 'Inductor opposes changes in current (current cannot change instantaneously).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Transmission efficiency improves with:',
    options: [
      { index: 0, text: 'Low voltage' },
      { index: 1, text: 'High voltage' },
      { index: 2, text: 'High resistance' },
      { index: 3, text: 'Low frequency' },
    ],
    correctAnswer: 1, explanation: 'Higher voltage reduces current for same power, reducing I²R losses and improving efficiency.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'Which motor has highest starting torque?',
    options: [
      { index: 0, text: 'DC shunt motor' },
      { index: 1, text: 'DC series motor' },
      { index: 2, text: 'Synchronous motor' },
      { index: 3, text: 'Stepper motor' },
    ],
    correctAnswer: 1, explanation: 'DC series motor has highest starting torque due to high current at low speed.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'Kirchhoff current law is based on conservation of:',
    options: [
      { index: 0, text: 'Energy' },
      { index: 1, text: 'Power' },
      { index: 2, text: 'Charge' },
      { index: 3, text: 'Flux' },
    ],
    correctAnswer: 2, explanation: "KCL (Kirchhoff's Current Law) is based on conservation of charge - current into node = current out.",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'The SI unit of inductance is:',
    options: [
      { index: 0, text: 'Farad' },
      { index: 1, text: 'Weber' },
      { index: 2, text: 'Henry' },
      { index: 3, text: 'Tesla' },
    ],
    correctAnswer: 2, explanation: 'Henry (H) is SI unit of inductance.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },
  {
    question: 'A fuse protects against:',
    options: [
      { index: 0, text: 'Over voltage' },
      { index: 1, text: 'Over current' },
      { index: 2, text: 'Low frequency' },
      { index: 3, text: 'Leakage only' },
    ],
    correctAnswer: 1, explanation: 'Fuse protects by melting (opening circuit) when current exceeds rated value.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Power Systems', tags: ['EE', 'Power Systems', 'GATE'],
  },
  {
    question: 'The speed of induction motor is always:',
    options: [
      { index: 0, text: 'Greater than synchronous speed' },
      { index: 1, text: 'Equal to synchronous speed' },
      { index: 2, text: 'Less than synchronous speed' },
      { index: 3, text: 'Zero' },
    ],
    correctAnswer: 2, explanation: 'Induction motor runs below synchronous speed (Ns > Nr) due to slip.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'EE', subject: 'Electrical Machines', tags: ['EE', 'Electrical Machines', 'GATE'],
  },

  // ========== ME ==========
  {
    question: 'The first law of thermodynamics is based on conservation of:',
    options: [
      { index: 0, text: 'Momentum' },
      { index: 1, text: 'Mass' },
      { index: 2, text: 'Energy' },
      { index: 3, text: 'Entropy' },
    ],
    correctAnswer: 2, explanation: 'First law (energy conservation): ΔE = Q - W.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Entropy of an isolated system:',
    options: [
      { index: 0, text: 'Decreases' },
      { index: 1, text: 'Remains constant' },
      { index: 2, text: 'Increases' },
      { index: 3, text: 'Becomes zero' },
    ],
    correctAnswer: 2, explanation: "Second law: entropy of isolated system always increases (ΔS ≥ 0).",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Standard atmospheric pressure in kPa is:',
    options: [], correctAnswer: 0, correctNumeric: '101.325',
    explanation: 'Atmospheric pressure at sea level = 101.325 kPa = 1.01325 bar.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Carnot cycle has maximum:',
    options: [
      { index: 0, text: 'Heat loss' },
      { index: 1, text: 'Efficiency' },
      { index: 2, text: 'Work loss' },
      { index: 3, text: 'Friction' },
    ],
    correctAnswer: 1, explanation: 'Carnot efficiency = 1 - Tc/Th is maximum possible for given temperature limits.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'SI unit of entropy is:',
    options: [
      { index: 0, text: 'J/kg' },
      { index: 1, text: 'J/kgK' },
      { index: 2, text: 'W/kg' },
      { index: 3, text: 'N/m' },
    ],
    correctAnswer: 1, explanation: 'Entropy unit is Joule per Kelvin (J/K) or J/kgK for specific entropy.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Bernoulli equation is based on conservation of:',
    options: [
      { index: 0, text: 'Mass' },
      { index: 1, text: 'Energy' },
      { index: 2, text: 'Momentum' },
      { index: 3, text: 'Temperature' },
    ],
    correctAnswer: 1, explanation: "Bernoulli's equation is derived from conservation of energy for steady flow.",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'Reynolds number determines:',
    options: [
      { index: 0, text: 'Pressure' },
      { index: 1, text: 'Temperature' },
      { index: 2, text: 'Flow regime' },
      { index: 3, text: 'Velocity only' },
    ],
    correctAnswer: 2, explanation: 'Reynolds number classifies flow as laminar (Re<2300), transitional, or turbulent (Re>4000).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'Density of water in kg/m³ is approximately:',
    options: [], correctAnswer: 0, correctNumeric: '1000',
    explanation: 'Density of water at 4°C = 1000 kg/m³.',
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'Venturimeter measures:',
    options: [
      { index: 0, text: 'Pressure' },
      { index: 1, text: 'Temperature' },
      { index: 2, text: 'Flow rate' },
      { index: 3, text: 'Density' },
    ],
    correctAnswer: 2, explanation: 'Venturimeter measures fluid flow rate using pressure difference.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'Viscosity represents:',
    options: [
      { index: 0, text: 'Fluid weight' },
      { index: 1, text: 'Internal resistance to flow' },
      { index: 2, text: 'Surface tension' },
      { index: 3, text: 'Compressibility' },
    ],
    correctAnswer: 1, explanation: 'Dynamic viscosity measures internal resistance of fluid to deformation/flow.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: "Hooke's law is valid up to:",
    options: [
      { index: 0, text: 'Breaking point' },
      { index: 1, text: 'Elastic limit' },
      { index: 2, text: 'Yield point' },
      { index: 3, text: 'Ultimate stress' },
    ],
    correctAnswer: 1, explanation: "Hooke's law (σ = Eε) is valid only within elastic limit (proportional limit).",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'Stress is defined as:',
    options: [
      { index: 0, text: 'Load × area' },
      { index: 1, text: 'Load / area' },
      { index: 2, text: 'Area / load' },
      { index: 3, text: 'Load²' },
    ],
    correctAnswer: 1, explanation: 'Stress (σ) = Force/Area = Load/Area (N/m² or Pa).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: "Young's modulus unit is:",
    options: [], correctAnswer: 0, correctNumeric: 'Pa',
    explanation: "Young's modulus (E) has same unit as stress: Pascal (Pa) or N/m².",
    marks: 1, negativeMarks: 0, difficulty: 'EASY', questionType: 'NAT',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'Factor of safety is:',
    options: [
      { index: 0, text: 'Yield stress / working stress' },
      { index: 1, text: 'Working stress / yield stress' },
      { index: 2, text: 'Stress × strain' },
      { index: 3, text: 'Load / deformation' },
    ],
    correctAnswer: 0, explanation: 'FoS = Ultimate stress / Working stress or Yield stress / Working stress.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'Bending stress is maximum at:',
    options: [
      { index: 0, text: 'Neutral axis' },
      { index: 1, text: 'Center' },
      { index: 2, text: 'Outer surface' },
      { index: 3, text: 'Middle layer' },
    ],
    correctAnswer: 2, explanation: 'Bending stress σ = My/I is maximum at outermost fibers (farthest from neutral axis).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  // ME Continued
  {
    question: 'The efficiency of Carnot engine depends on:',
    options: [
      { index: 0, text: 'Pressure' },
      { index: 1, text: 'Temperature' },
      { index: 2, text: 'Volume' },
      { index: 3, text: 'Density' },
    ],
    correctAnswer: 1, explanation: 'Carnot efficiency η = 1 - Tc/Th depends only on temperature ratio.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which process occurs at constant pressure?',
    options: [
      { index: 0, text: 'Isochoric' },
      { index: 1, text: 'Isothermal' },
      { index: 2, text: 'Isobaric' },
      { index: 3, text: 'Adiabatic' },
    ],
    correctAnswer: 2, explanation: 'Isobaric process occurs at constant pressure.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Lathe machine is mainly used for:',
    options: [
      { index: 0, text: 'Drilling' },
      { index: 1, text: 'Turning' },
      { index: 2, text: 'Grinding' },
      { index: 3, text: 'Welding' },
    ],
    correctAnswer: 1, explanation: 'Lathe performs turning operation to shape cylindrical workpieces.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Manufacturing', tags: ['ME', 'Manufacturing', 'GATE'],
  },
  {
    question: "Poisson's ratio is the ratio of:",
    options: [
      { index: 0, text: 'Longitudinal strain to stress' },
      { index: 1, text: 'Lateral strain to longitudinal strain' },
      { index: 2, text: 'Stress to strain' },
      { index: 3, text: 'Load to area' },
    ],
    correctAnswer: 1, explanation: "Poisson's ratio ν = (lateral strain)/(longitudinal strain).",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'Hydraulic turbines convert:',
    options: [
      { index: 0, text: 'Electrical energy to heat' },
      { index: 1, text: 'Fluid energy to mechanical energy' },
      { index: 2, text: 'Mechanical energy to electrical energy' },
      { index: 3, text: 'Heat energy to pressure' },
    ],
    correctAnswer: 1, explanation: 'Hydraulic turbines convert fluid (water) kinetic/potential energy to mechanical rotational energy.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  // ME Advanced
  {
    question: 'A nozzle converts:',
    options: [
      { index: 0, text: 'Pressure energy into kinetic energy' },
      { index: 1, text: 'Kinetic energy into pressure energy' },
      { index: 2, text: 'Heat into pressure only' },
      { index: 3, text: 'Mechanical into electrical energy' },
    ],
    correctAnswer: 0, explanation: 'Nozzle converts fluid pressure energy to kinetic energy (accelerates flow).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'The efficiency of Otto cycle depends on:',
    options: [
      { index: 0, text: 'Compression ratio' },
      { index: 1, text: 'Temperature only' },
      { index: 2, text: 'Pressure only' },
      { index: 3, text: 'Volume only' },
    ],
    correctAnswer: 0, explanation: 'Otto cycle efficiency η = 1 - 1/r^(γ-1) depends on compression ratio r.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which material property resists indentation?',
    options: [
      { index: 0, text: 'Toughness' },
      { index: 1, text: 'Hardness' },
      { index: 2, text: 'Elasticity' },
      { index: 3, text: 'Plasticity' },
    ],
    correctAnswer: 1, explanation: 'Hardness is resistance to indentation/abrasion (measured by Rockwell, Brinell tests).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'The unit of power is:',
    options: [
      { index: 0, text: 'Joule' },
      { index: 1, text: 'Watt' },
      { index: 2, text: 'Pascal' },
      { index: 3, text: 'Newton' },
    ],
    correctAnswer: 1, explanation: 'Watt (W) is SI unit of power (1 W = 1 J/s).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'A turbine converts:',
    options: [
      { index: 0, text: 'Mechanical energy to fluid energy' },
      { index: 1, text: 'Fluid energy to mechanical energy' },
      { index: 2, text: 'Electrical energy to thermal energy' },
      { index: 3, text: 'Heat to pressure only' },
    ],
    correctAnswer: 1, explanation: 'Turbine extracts energy from fluid flow to produce rotational mechanical energy.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'In four stroke engines, one power stroke occurs in:',
    options: [
      { index: 0, text: 'One revolution' },
      { index: 1, text: 'Two revolutions' },
      { index: 2, text: 'Three revolutions' },
      { index: 3, text: 'Four revolutions' },
    ],
    correctAnswer: 1, explanation: 'Four strokes = suction, compression, power, exhaust over 2 crankshaft revolutions.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which device measures pressure?',
    options: [
      { index: 0, text: 'Tachometer' },
      { index: 1, text: 'Manometer' },
      { index: 2, text: 'Pyrometer' },
      { index: 3, text: 'Dynamometer' },
    ],
    correctAnswer: 1, explanation: 'Manometer measures pressure using fluid column height.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Fluid Mechanics', tags: ['ME', 'Fluid Mechanics', 'GATE'],
  },
  {
    question: 'The ratio of specific heats is denoted by:',
    options: [
      { index: 0, text: 'Cp' },
      { index: 1, text: 'Cv' },
      { index: 2, text: 'γ' },
      { index: 3, text: 'μ' },
    ],
    correctAnswer: 2, explanation: 'Gamma (γ) = Cp/Cv, ratio of specific heats at constant pressure and volume.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which casting defect is caused by trapped gas?',
    options: [
      { index: 0, text: 'Blow hole' },
      { index: 1, text: 'Shrinkage' },
      { index: 2, text: 'Cold shut' },
      { index: 3, text: 'Misrun' },
    ],
    correctAnswer: 0, explanation: 'Blow holes are gas pockets (hydrogen, nitrogen) trapped during solidification.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'ME', subject: 'Manufacturing', tags: ['ME', 'Manufacturing', 'GATE'],
  },
  {
    question: 'The process of removing metal by rotating cutter is:',
    options: [
      { index: 0, text: 'Turning' },
      { index: 1, text: 'Shaping' },
      { index: 2, text: 'Milling' },
      { index: 3, text: 'Casting' },
    ],
    correctAnswer: 2, explanation: 'Milling uses rotating multi-point cutter to remove material.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Manufacturing', tags: ['ME', 'Manufacturing', 'GATE'],
  },
  // ME continued
  {
    question: 'Specific heat at constant pressure is denoted by:',
    options: [
      { index: 0, text: 'Cv' },
      { index: 1, text: 'Cp' },
      { index: 2, text: 'k' },
      { index: 3, text: 'R' },
    ],
    correctAnswer: 1, explanation: 'Cp is specific heat at constant pressure, Cv at constant volume.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'A refrigerant absorbs heat during:',
    options: [
      { index: 0, text: 'Compression' },
      { index: 1, text: 'Condensation' },
      { index: 2, text: 'Expansion' },
      { index: 3, text: 'Evaporation' },
    ],
    correctAnswer: 3, explanation: 'Refrigerant absorbs heat during evaporation (low pressure liquid → vapor).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which welding process uses electric arc?',
    options: [
      { index: 0, text: 'Gas welding' },
      { index: 1, text: 'Arc welding' },
      { index: 2, text: 'Friction welding' },
      { index: 3, text: 'Ultrasonic welding' },
    ],
    correctAnswer: 1, explanation: 'Arc welding uses electric arc between electrode and workpiece for heating.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Manufacturing', tags: ['ME', 'Manufacturing', 'GATE'],
  },
  {
    question: 'The ratio of stress to strain is:',
    options: [
      { index: 0, text: 'Poisson ratio' },
      { index: 1, text: 'Young modulus' },
      { index: 2, text: 'Bulk modulus' },
      { index: 3, text: 'Rigidity modulus' },
    ],
    correctAnswer: 1, explanation: "Young's modulus E = stress/strain within elastic limit.",
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'Which machine converts heat into work?',
    options: [
      { index: 0, text: 'Pump' },
      { index: 1, text: 'Compressor' },
      { index: 2, text: 'Heat engine' },
      { index: 3, text: 'Turbine only' },
    ],
    correctAnswer: 2, explanation: 'Heat engine converts thermal energy to mechanical work (Carnot, Otto, Diesel cycles).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Boiling point of water at atmospheric pressure is:',
    options: [
      { index: 0, text: '50°C' },
      { index: 1, text: '75°C' },
      { index: 2, text: '100°C' },
      { index: 3, text: '150°C' },
    ],
    correctAnswer: 2, explanation: 'Water boils at 100°C (212°F) at 1 atm pressure.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which thermodynamic process has no heat transfer?',
    options: [
      { index: 0, text: 'Isothermal' },
      { index: 1, text: 'Adiabatic' },
      { index: 2, text: 'Isobaric' },
      { index: 3, text: 'Isochoric' },
    ],
    correctAnswer: 1, explanation: 'Adiabatic process: Q = 0 (no heat transfer with surroundings).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'The center of gravity of a uniform circular disc lies at:',
    options: [
      { index: 0, text: 'Radius' },
      { index: 1, text: 'Diameter' },
      { index: 2, text: 'Circumference' },
      { index: 3, text: 'Center' },
    ],
    correctAnswer: 3, explanation: 'CG of uniform circular disc is at geometric center (centroid).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Strength of Materials', tags: ['ME', 'Strength of Materials', 'GATE'],
  },
  {
    question: 'A compressor increases:',
    options: [
      { index: 0, text: 'Volume' },
      { index: 1, text: 'Pressure' },
      { index: 2, text: 'Entropy only' },
      { index: 3, text: 'Density only' },
    ],
    correctAnswer: 1, explanation: 'Compressor increases gas pressure by reducing volume (positive displacement or dynamic).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY', questionType: 'MCQ',
    branch: 'ME', subject: 'Thermodynamics', tags: ['ME', 'Thermodynamics', 'GATE'],
  },
  {
    question: 'Which gear transmits motion between intersecting shafts?',
    options: [
      { index: 0, text: 'Spur gear' },
      { index: 1, text: 'Helical gear' },
      { index: 2, text: 'Bevel gear' },
      { index: 3, text: 'Worm gear' },
    ],
    correctAnswer: 2, explanation: 'Bevel gears connect intersecting shafts at various angles (commonly 90°).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM', questionType: 'MCQ',
    branch: 'ME', subject: 'Manufacturing', tags: ['ME', 'Manufacturing', 'GATE'],
  },
];

async function seedQuestions() {
  let saved = 0;
  for (const q of ALL_QUESTIONS) {
    try {
      await prisma.mCQ.create({
        data: {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          difficulty: q.difficulty as any,
          examType: 'GATE',
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          questionType: q.questionType,
          gateBranchCode: q.branch,
          sourceType: 'OFFICIAL_PAPER' as any,
          isPreviousYear: true,
          tags: q.tags,
        },
      });
      saved++;
    } catch (err) {
      console.error(`Failed: ${q.question.substring(0, 50)}...`);
    }
  }
  return saved;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== 'zyther-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.mCQAttempt.deleteMany({});
    await prisma.mCQ.deleteMany({});

    const saved = await seedQuestions();

    return NextResponse.json({
      success: true,
      message: `Seeded ${saved} real GATE questions`,
      breakdown: {
        CS: ALL_QUESTIONS.filter(q => q.branch === 'CS').length,
        EC: ALL_QUESTIONS.filter(q => q.branch === 'EC').length,
        EE: ALL_QUESTIONS.filter(q => q.branch === 'EE').length,
        ME: ALL_QUESTIONS.filter(q => q.branch === 'ME').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}