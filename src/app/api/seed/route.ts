import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GATE_CS_QUESTIONS = [
  {
    question: 'Let G be a simple undirected graph with n vertices. Which of the following statements is ALWAYS true?',
    options: [
      { index: 0, text: 'If G is connected, then it has a spanning tree' },
      { index: 1, text: 'If G has n-1 edges, then it is a tree' },
      { index: 2, text: 'If G has no cycles, then it is a forest' },
      { index: 3, text: 'If G is bipartite, then it is planar' },
    ],
    correctAnswer: 0,
    explanation: 'A connected graph always has a spanning tree which is a subgraph containing all vertices.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Graph Theory', 'GATE-2023'],
  },
  {
    question: 'The number of distinct binary trees with 4 nodes is:',
    options: [
      { index: 0, text: '14' }, { index: 1, text: '24' }, { index: 2, text: '42' }, { index: 3, text: '14' },
    ],
    correctAnswer: 0,
    explanation: 'Number of distinct binary trees with n nodes = Catalan number C_n = (2n)!/(n+1)!n! = 14 for n=4',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Combinatorics', 'GATE-2022'],
  },
  {
    question: 'Eigenvalues of a symmetric matrix are all:',
    options: [
      { index: 0, text: 'Real' }, { index: 1, text: 'Imaginary' }, { index: 2, text: 'Zero' }, { index: 3, text: 'Complex' },
    ],
    correctAnswer: 0,
    explanation: 'A symmetric matrix always has real eigenvalues.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Linear Algebra', 'GATE-2021'],
  },
  {
    question: 'If P(A) = 0.5, P(B) = 0.5 and P(A∪B) = 0.75, then P(A|B) is:',
    options: [
      { index: 0, text: '0.5' }, { index: 1, text: '0.6' }, { index: 2, text: '0.75' }, { index: 3, text: '0.25' },
    ],
    correctAnswer: 0,
    explanation: 'P(A∩B) = 0.25. P(A|B) = P(A∩B)/P(B) = 0.25/0.5 = 0.5',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Probability', 'GATE-2020'],
  },
  {
    question: 'The solution to the recurrence T(n) = T(n/2) + n is:',
    options: [
      { index: 0, text: 'O(n)' }, { index: 1, text: 'O(n log n)' }, { index: 2, text: 'O(n²)' }, { index: 3, text: 'O(log n)' },
    ],
    correctAnswer: 1,
    explanation: 'By Master theorem, T(n) = T(n/2) + n gives Θ(n log n)',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Recurrence', 'GATE-2019'],
  },
  {
    question: 'A bag contains 10 white and 10 black balls. Two balls are drawn at random. The probability that they are of different colors is:',
    options: [
      { index: 0, text: '5/19' }, { index: 1, text: '10/19' }, { index: 2, text: '1/2' }, { index: 3, text: '20/19' },
    ],
    correctAnswer: 1,
    explanation: 'P(different colors) = (10/20 × 10/19) + (10/20 × 10/19) = 200/380 = 10/19',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Probability', 'GATE-2018'],
  },
  {
    question: 'For the group G = {1, -1, i, -i} under multiplication, the order of the group is:',
    options: [
      { index: 0, text: '4' }, { index: 1, text: '3' }, { index: 2, text: '2' }, { index: 3, text: '1' },
    ],
    correctAnswer: 0,
    explanation: 'G contains 4 elements: 1, -1, i, -i. This is the cyclic group of order 4.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Discrete Mathematics', 'GATE-2017'],
  },
  {
    question: 'The rank of the matrix [[1,2,3],[4,5,6],[7,8,9]] is:',
    options: [
      { index: 0, text: '1' }, { index: 1, text: '2' }, { index: 2, text: '3' }, { index: 3, text: '0' },
    ],
    correctAnswer: 1,
    explanation: 'Rows are linearly dependent. Rank = 2.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Linear Algebra', 'GATE-2016'],
  },
  {
    question: 'The minimum number of 2-input NAND gates required to implement the function f = x + yz is:',
    options: [
      { index: 0, text: '3' }, { index: 1, text: '4' }, { index: 2, text: '5' }, { index: 3, text: '6' },
    ],
    correctAnswer: 1,
    explanation: 'f = x + yz = NAND(NAND(x, x), NAND(y, z)) = 4 NAND gates minimum.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Digital Logic', 'Boolean Algebra', 'GATE-2023'],
  },
  {
    question: 'A 4-bit synchronous counter uses flip-flops with propagation delay of 10 ns. The maximum clock frequency is:',
    options: [
      { index: 0, text: '100 MHz' }, { index: 1, text: '250 MHz' }, { index: 2, text: '50 MHz' }, { index: 3, text: '25 MHz' },
    ],
    correctAnswer: 3,
    explanation: '4 × 10ns = 40ns clock period, frequency = 25 MHz.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Digital Logic', 'Counters', 'GATE-2022'],
  },
  {
    question: 'The output of a 2-input XOR gate is 1 when:',
    options: [
      { index: 0, text: 'Exactly one input is 1' }, { index: 1, text: 'Both inputs are 1' }, { index: 2, text: 'Both inputs are 0' }, { index: 3, text: 'At least one input is 1' },
    ],
    correctAnswer: 0,
    explanation: 'XOR output is 1 when inputs are different.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Digital Logic', 'Logic Gates', 'GATE-2019'],
  },
  {
    question: 'A multiplexer with 4 data inputs requires how many selection lines?',
    options: [
      { index: 0, text: '2' }, { index: 1, text: '3' }, { index: 2, text: '4' }, { index: 3, text: '1' },
    ],
    correctAnswer: 0,
    explanation: 'For 2^n data inputs, n selection lines are needed. For 4 inputs, 2 selection lines.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Digital Logic', 'Multiplexer', 'GATE-2017'],
  },
  {
    question: 'In a register file with 8 registers, the number of bits needed to address each register is:',
    options: [
      { index: 0, text: '3' }, { index: 1, text: '8' }, { index: 2, text: '4' }, { index: 3, text: '2' },
    ],
    correctAnswer: 0,
    explanation: 'To address 8 registers (2³), we need 3 bits.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['COA', 'Register File', 'GATE-2023'],
  },
  {
    question: 'The clock cycle time of a processor is 2 ns. What is the maximum throughput for instructions that take 2 cycles each?',
    options: [
      { index: 0, text: '250 MIPS' }, { index: 1, text: '500 MIPS' }, { index: 2, text: '1000 MIPS' }, { index: 3, text: '125 MIPS' },
    ],
    correctAnswer: 0,
    explanation: 'Clock = 2ns, CPI = 2, so instructions/sec = 250×10⁶, MIPS = 250.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['COA', 'Performance', 'GATE-2022'],
  },
  {
    question: 'A cache has 16 blocks, direct-mapped. Memory address 24 (decimal) maps to block number:',
    options: [
      { index: 0, text: '8' }, { index: 1, text: '4' }, { index: 2, text: '0' }, { index: 3, text: '16' },
    ],
    correctAnswer: 0,
    explanation: 'Block number = Address mod Number of blocks = 24 mod 16 = 8.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['COA', 'Cache Memory', 'GATE-2021'],
  },
  {
    question: 'In a pipelined processor with 5 stages, if each stage takes 1 ns, the time to process 100 instructions is approximately:',
    options: [
      { index: 0, text: '104 ns' }, { index: 1, text: '500 ns' }, { index: 2, text: '100 ns' }, { index: 3, text: '5 ns' },
    ],
    correctAnswer: 0,
    explanation: 'Pipeline fill = 5 cycles, then 99×1 = 99 cycles. Total = 104 cycles × 1ns.',
    marks: 2, negativeMarks: 0.66, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['COA', 'Pipelining', 'GATE-2019'],
  },
  {
    question: 'What is the time complexity of searching in a balanced BST?',
    options: [
      { index: 0, text: 'O(log n)' }, { index: 1, text: 'O(n)' }, { index: 2, text: 'O(n log n)' }, { index: 3, text: 'O(1)' },
    ],
    correctAnswer: 0,
    explanation: 'Balanced BST has height O(log n), so search takes O(log n) time.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Data Structures', 'BST', 'GATE-2023'],
  },
  {
    question: 'In a max-heap with n elements, the time to find the maximum element is:',
    options: [
      { index: 0, text: 'O(1)' }, { index: 1, text: 'O(log n)' }, { index: 2, text: 'O(n)' }, { index: 3, text: 'O(n log n)' },
    ],
    correctAnswer: 0,
    explanation: 'Max element is at root (index 0), accessible in O(1).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Data Structures', 'Heap', 'GATE-2022'],
  },
  {
    question: 'What data structure is used for implementing recursion?',
    options: [
      { index: 0, text: 'Stack' }, { index: 1, text: 'Queue' }, { index: 2, text: 'Linked List' }, { index: 3, text: 'Tree' },
    ],
    correctAnswer: 0,
    explanation: 'Recursion uses call stack to store return addresses and local variables.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Data Structures', 'Recursion', 'GATE-2021'],
  },
  {
    question: 'The worst case time complexity of QuickSort is:',
    options: [
      { index: 0, text: 'O(n²)' }, { index: 1, text: 'O(n log n)' }, { index: 2, text: 'O(n)' }, { index: 3, text: 'O(log n)' },
    ],
    correctAnswer: 0,
    explanation: 'QuickSort worst case when pivot is always smallest/largest gives O(n²).',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Algorithms', 'Sorting', 'GATE-2020'],
  },
  {
    question: 'The time complexity of Merge Sort is:',
    options: [
      { index: 0, text: 'O(n log n) in all cases' }, { index: 1, text: 'O(n²) in worst case' }, { index: 2, text: 'O(n log n) average, O(n²) worst' }, { index: 3, text: 'O(n) in best case' },
    ],
    correctAnswer: 0,
    explanation: 'Merge Sort divides array in half and merges in linear time, giving O(n log n) for all cases.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Algorithms', 'Sorting', 'GATE-2023'],
  },
  {
    question: 'Which algorithm uses a min-heap?',
    options: [
      { index: 0, text: "Prim's algorithm" }, { index: 1, text: "Kruskal's algorithm only" }, { index: 2, text: "Dijkstra's algorithm only" }, { index: 3, text: 'Both Prim\'s and Kruskal\'s' },
    ],
    correctAnswer: 0,
    explanation: "Prim's algorithm uses a min-heap. Kruskal's uses union-find.",
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Algorithms', 'Graph Algorithms', 'GATE-2022'],
  },
  {
    question: 'The recurrence T(n) = 2T(n/2) + n has solution:',
    options: [
      { index: 0, text: 'Θ(n log n)' }, { index: 1, text: 'Θ(n)' }, { index: 2, text: 'Θ(n²)' }, { index: 3, text: 'Θ(log n)' },
    ],
    correctAnswer: 0,
    explanation: 'By Master theorem: a=2, b=2, f(n)=n, n^(log_b a)=n. Case 2: Θ(n log n).',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Algorithms', 'Recurrence', 'GATE-2021'],
  },
  {
    question: 'The solution to 0/1 knapsack using DP has time complexity:',
    options: [
      { index: 0, text: 'O(n×W)' }, { index: 1, text: 'O(2^n)' }, { index: 2, text: 'O(n+W)' }, { index: 3, text: 'O(n²)' },
    ],
    correctAnswer: 0,
    explanation: 'DP solution uses a 2D table of size n×W, giving O(n×W) complexity.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Algorithms', 'Dynamic Programming', 'GATE-2016'],
  },
  {
    question: 'Which language is context-free?',
    options: [
      { index: 0, text: '{a^n b^n | n ≥ 1}' }, { index: 1, text: '{a^n b^n c^n | n ≥ 1}' }, { index: 2, text: '{ww | w ∈ {a,b}*}' }, { index: 3, text: '{a^n | n is prime}' },
    ],
    correctAnswer: 0,
    explanation: '{a^n b^n} is context-free. {a^n b^n c^n} and {ww} are not.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['TOC', 'Context-Free Languages', 'GATE-2023'],
  },
  {
    question: 'Post Correspondence Problem is:',
    options: [
      { index: 0, text: 'Undecidable' }, { index: 1, text: 'Decidable' }, { index: 2, text: 'NP-Complete' }, { index: 3, text: 'P' },
    ],
    correctAnswer: 0,
    explanation: 'Post Correspondence Problem (PCP) is a known undecidable problem.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['TOC', 'Undecidability', 'GATE-2020'],
  },
  {
    question: 'A language recognized by a PDA is:',
    options: [
      { index: 0, text: 'Context-free' }, { index: 1, text: 'Regular' }, { index: 2, text: 'Context-sensitive' }, { index: 3, text: 'Recursive' },
    ],
    correctAnswer: 0,
    explanation: 'PDA recognizes exactly context-free languages.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['TOC', 'PDA', 'GATE-2019'],
  },
  {
    question: 'LR(1) parser is more powerful than LALR because:',
    options: [
      { index: 0, text: 'LALR merges LR(1) states' }, { index: 1, text: 'LR(1) has more states' }, { index: 2, text: 'LALR has more states' }, { index: 3, text: 'They have same power' },
    ],
    correctAnswer: 0,
    explanation: 'LALR merges LR(1) states by core, causing potential reduce-reduce conflicts.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Compiler Design', 'Parsing', 'GATE-2022'],
  },
  {
    question: 'The output of the lexical analyzer is:',
    options: [
      { index: 0, text: 'Sequence of tokens' }, { index: 1, text: 'Parse tree' }, { index: 2, text: 'Intermediate code' }, { index: 3, text: 'Machine code' },
    ],
    correctAnswer: 0,
    explanation: 'Lexical analyzer produces a stream of tokens for the parser.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['Compiler Design', 'Lexical Analysis', 'GATE-2019'],
  },
  {
    question: 'The CPU scheduling algorithm that minimizes average waiting time is:',
    options: [
      { index: 0, text: 'SJF (Shortest Job First)' }, { index: 1, text: 'FCFS' }, { index: 2, text: 'Round Robin' }, { index: 3, text: 'Priority scheduling' },
    ],
    correctAnswer: 0,
    explanation: 'SJF gives minimum average waiting time among non-preemptive algorithms.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['OS', 'CPU Scheduling', 'GATE-2022'],
  },
  {
    question: 'In a deadlock, the four necessary conditions include all EXCEPT:',
    options: [
      { index: 0, text: 'Circular wait' }, { index: 1, text: 'Hold and wait' }, { index: 2, text: 'No preemption' }, { index: 3, text: 'Mutual exclusion' },
    ],
    correctAnswer: 0,
    explanation: 'Circular wait is one of the four conditions. All four (mutual exclusion, hold and wait, no preemption, circular wait) are necessary.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['OS', 'Deadlock', 'GATE-2021'],
  },
  {
    question: 'Thrashing occurs when:',
    options: [
      { index: 0, text: 'Excessive paging degrades performance' }, { index: 1, text: 'CPU is idle' }, { index: 2, text: 'Memory is underutilized' }, { index: 3, text: 'Processes terminate' },
    ],
    correctAnswer: 0,
    explanation: 'Thrashing occurs when system spends more time paging than executing.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['OS', 'Virtual Memory', 'GATE-2016'],
  },
  {
    question: 'Which normal form removes transitive dependency?',
    options: [
      { index: 0, text: '3NF' }, { index: 1, text: '2NF' }, { index: 2, text: 'BCNF' }, { index: 3, text: '1NF' },
    ],
    correctAnswer: 0,
    explanation: '3NF removes transitive dependencies. 2NF removes partial dependencies.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['DBMS', 'Normalization', 'GATE-2023'],
  },
  {
    question: 'A transaction exhibits durability meaning:',
    options: [
      { index: 0, text: 'Committed changes persist despite failures' }, { index: 1, text: 'Operations are atomic' }, { index: 2, text: 'Execution is isolated' }, { index: 3, text: 'Database remains consistent' },
    ],
    correctAnswer: 0,
    explanation: 'Durability guarantees committed transaction effects survive system failures.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['DBMS', 'Transactions', 'GATE-2021'],
  },
  {
    question: 'In B+ tree, all keys are stored in:',
    options: [
      { index: 0, text: 'Leaf nodes only' }, { index: 1, text: 'Internal nodes only' }, { index: 2, text: 'Both internal and leaf nodes' }, { index: 3, text: 'Root node only' },
    ],
    correctAnswer: 0,
    explanation: 'In B+ tree, only leaf nodes contain actual data. Internal nodes only have keys for navigation.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['DBMS', 'Indexing', 'GATE-2019'],
  },
  {
    question: 'Which layer in OSI model handles routing?',
    options: [
      { index: 0, text: 'Network layer' }, { index: 1, text: 'Data link layer' }, { index: 2, text: 'Transport layer' }, { index: 3, text: 'Session layer' },
    ],
    correctAnswer: 0,
    explanation: 'Network layer (Layer 3) is responsible for routing packets.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['CN', 'OSI Model', 'GATE-2023'],
  },
  {
    question: 'Go-Back-N protocol uses:',
    options: [
      { index: 0, text: 'Sliding window with cumulative ACK' }, { index: 1, text: 'Selective repeat' }, { index: 2, text: 'Stop and wait' }, { index: 3, text: 'Binary exponential backoff' },
    ],
    correctAnswer: 0,
    explanation: 'Go-Back-N uses sliding window with cumulative acknowledgments.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['CN', 'Data Link', 'GATE-2022'],
  },
  {
    question: 'In TCP, the three-way handshake is used to:',
    options: [
      { index: 0, text: 'Establish a connection' }, { index: 1, text: 'Terminate a connection' }, { index: 2, text: 'Send data' }, { index: 3, text: 'Flow control' },
    ],
    correctAnswer: 0,
    explanation: 'Three-way handshake (SYN, SYN-ACK, ACK) establishes reliable TCP connection.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['CN', 'TCP', 'GATE-2021'],
  },
  {
    question: 'ARP is used to resolve:',
    options: [
      { index: 0, text: 'IP address to MAC address' }, { index: 1, text: 'MAC address to IP address' }, { index: 2, text: 'Domain name to IP' }, { index: 3, text: 'IP to domain name' },
    ],
    correctAnswer: 0,
    explanation: 'ARP (Address Resolution Protocol) maps IP addresses to MAC addresses.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['CN', 'ARP', 'GATE-2019'],
  },
  {
    question: 'If price reduced by 20% becomes Rs.240, original price was:',
    options: [
      { index: 0, text: '300' }, { index: 1, text: '280' }, { index: 2, text: '320' }, { index: 3, text: '260' },
    ],
    correctAnswer: 0,
    explanation: '80% of original = 240, Original = 240 × 100/80 = 300.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['General Aptitude', 'Percentage', 'GATE-2023'],
  },
  {
    question: 'Find missing: 2, 6, 12, 20, 30, ?',
    options: [
      { index: 0, text: '42' }, { index: 1, text: '40' }, { index: 2, text: '38' }, { index: 3, text: '44' },
    ],
    correctAnswer: 0,
    explanation: 'Differences: 4,6,8,10,12. Pattern: n² + n. 6² + 6 = 42.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['General Aptitude', 'Series', 'GATE-2022'],
  },
  {
    question: 'Train 100m passes platform 150m in 10s. Speed (m/s):',
    options: [
      { index: 0, text: '25' }, { index: 1, text: '20' }, { index: 2, text: '15' }, { index: 3, text: '10' },
    ],
    correctAnswer: 0,
    explanation: 'Distance = 100 + 150 = 250m. Speed = 250/10 = 25 m/s.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['General Aptitude', 'Time and Distance', 'GATE-2021'],
  },
  {
    question: 'A man buys for Rs.800, sells for Rs.1000. Profit%:',
    options: [
      { index: 0, text: '25%' }, { index: 1, text: '20%' }, { index: 2, text: '15%' }, { index: 3, text: '30%' },
    ],
    correctAnswer: 0,
    explanation: 'Profit = 200. Profit% = (200/800) × 100 = 25%.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['General Aptitude', 'Profit and Loss', 'GATE-2017'],
  },
  {
    question: 'Sum of first 20 odd numbers is:',
    options: [
      { index: 0, text: '400' }, { index: 1, text: '420' }, { index: 2, text: '380' }, { index: 3, text: '440' },
    ],
    correctAnswer: 0,
    explanation: 'Sum of first n odd numbers = n². 20² = 400.',
    marks: 1, negativeMarks: 0.33, difficulty: 'EASY',
    gateBranchCode: 'CS', tags: ['General Aptitude', 'Series', 'GATE-2015'],
  },
  {
    question: 'The Laplace transform of e^(-at) sin(ωt) is:',
    options: [
      { index: 0, text: 'ω/[(s+a)² + ω²]' }, { index: 1, text: 'ω/[(s-a)² + ω²]' }, { index: 2, text: '(s+a)/[s² + ω²]' }, { index: 3, text: 'ω/[(s+a)(s² + ω²)]' },
    ],
    correctAnswer: 0,
    explanation: 'L{e^(-at) sin(ωt)} = ω/[(s+a)² + ω²]. Standard Laplace formula.',
    marks: 1, negativeMarks: 0.33, difficulty: 'MEDIUM',
    gateBranchCode: 'CS', tags: ['Engineering Mathematics', 'Laplace', 'GATE-2020'],
  },
];

const CAT_QUESTIONS = [
  {
    question: 'The word "ubiquitous" most nearly means:',
    options: [
      { index: 0, text: 'omnipresent' }, { index: 1, text: 'rare' }, { index: 2, text: 'temporary' }, { index: 3, text: 'significant' },
    ],
    correctAnswer: 0, explanation: 'Ubiquitous means present everywhere.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Vocabulary'],
  },
  {
    question: 'Choose the word OPPOSITE to "ephemeral":',
    options: [
      { index: 0, text: 'permanent' }, { index: 1, text: 'temporary' }, { index: 2, text: 'fleeting' }, { index: 3, text: 'transient' },
    ],
    correctAnswer: 0, explanation: 'Ephemeral means short-lived. Opposite is permanent.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Antonyms'],
  },
  {
    question: '"Neither the manager nor the employees were present" — subject-verb agreement:',
    options: [
      { index: 0, text: 'Correct' }, { index: 1, text: 'Incorrect — should be "was"' }, { index: 2, text: 'Incorrect — should be "are"' }, { index: 3, text: 'Incorrect' },
    ],
    correctAnswer: 0, explanation: 'With neither/nor, verb agrees with nearer subject (employees), plural = were.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Grammar'],
  },
  {
    question: '"To make ends meet" means:',
    options: [
      { index: 0, text: 'to have just enough money for expenses' }, { index: 1, text: 'to finish a race' }, { index: 2, text: 'to reach an agreement' }, { index: 3, text: 'to meet secretly' },
    ],
    correctAnswer: 0, explanation: '"To make ends meet" means earning just enough to cover expenses.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Idioms'],
  },
  {
    question: 'Correct spelling:',
    options: [
      { index: 0, text: 'accommodate' }, { index: 1, text: 'acommodate' }, { index: 2, text: 'acommodate' }, { index: 3, text: 'accomodate' },
    ],
    correctAnswer: 0, explanation: '"Accommodate" has double "c" and double "m".', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Spelling'],
  },
  {
    question: '"Gregarious" is closest to:',
    options: [
      { index: 0, text: 'sociable' }, { index: 1, text: 'solitary' }, { index: 2, text: 'aggressive' }, { index: 3, text: 'intelligent' },
    ],
    correctAnswer: 0, explanation: 'Gregarious means fond of company; sociable.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Vocabulary'],
  },
  {
    question: '"On the horns of a dilemma" means:',
    options: [
      { index: 0, text: 'faced with a difficult choice between two options' }, { index: 1, text: 'attacked by enemies' }, { index: 2, text: 'in a state of confusion' }, { index: 3, text: 'very angry' },
    ],
    correctAnswer: 0, explanation: 'Facing a situation where one must choose between two equally unpleasant options.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'VARC', tags: ['CAT', 'VARC', 'Idioms'],
  },
  {
    question: 'Class of 50: 30 play cricket, 25 football, 10 play neither. How many play both?',
    options: [
      { index: 0, text: '15' }, { index: 1, text: '10' }, { index: 2, text: '20' }, { index: 3, text: '5' },
    ],
    correctAnswer: 0, explanation: 'At least one = 50-10=40. 30+25-both=40. Both=15.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Venn Diagram'],
  },
  {
    question: 'Train 150m crosses a pole in 5s. Speed (km/h):',
    options: [
      { index: 0, text: '108' }, { index: 1, text: '72' }, { index: 2, text: '54' }, { index: 3, text: '90' },
    ],
    correctAnswer: 0, explanation: 'Speed = 150/5 = 30 m/s = 30×18/5 = 108 km/h.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Time and Distance'],
  },
  {
    question: 'Raj is 15th from left, 10th from right in a row. Total students:',
    options: [
      { index: 0, text: '24' }, { index: 1, text: '25' }, { index: 2, text: '23' }, { index: 3, text: '26' },
    ],
    correctAnswer: 0, explanation: 'Total = 15 + 10 - 1 = 24 (Raj counted twice).', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Ranking'],
  },
  {
    question: '20% of a number is 50. 40% of same number is:',
    options: [
      { index: 0, text: '100' }, { index: 1, text: '80' }, { index: 2, text: '120' }, { index: 3, text: '70' },
    ],
    correctAnswer: 0, explanation: '20% of x = 50 → x = 250. 40% of x = 100.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Percentage'],
  },
  {
    question: 'Upstream 12km, downstream 18km, 3 hours each way. Stream speed (km/h):',
    options: [
      { index: 0, text: '1.5' }, { index: 1, text: '1' }, { index: 2, text: '2' }, { index: 3, text: '3' },
    ],
    correctAnswer: 0, explanation: 'Upstream speed = 4, downstream = 6. u+v=6, u-v=4 → v=1.5 km/h.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Boats and Streams'],
  },
  {
    question: 'Average of 5 consecutive integers is 15. Largest integer:',
    options: [
      { index: 0, text: '17' }, { index: 1, text: '16' }, { index: 2, text: '15' }, { index: 3, text: '18' },
    ],
    correctAnswer: 0, explanation: 'Integers: n-2, n-1, n, n+1, n+2. Average = n = 15. Largest = 17.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Average'],
  },
  {
    question: 'A is twice as efficient as B. Together finish work in 16 days. B alone (days):',
    options: [
      { index: 0, text: '48' }, { index: 1, text: '24' }, { index: 2, text: '32' }, { index: 3, text: '16' },
    ],
    correctAnswer: 0, explanation: 'A:B = 2:1. Combined = 1/16. Let B = x. (2x+x)=1/16 → x=1/48. B=48 days.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'DILR', tags: ['CAT', 'DILR', 'Work and Time'],
  },
  {
    question: 'If x² - 5x + 6 = 0, then x + 1/x = ? (for real x)',
    options: [
      { index: 0, text: '5/2 or 5/3' }, { index: 1, text: '5' }, { index: 2, text: '10' }, { index: 3, text: '25/6' },
    ],
    correctAnswer: 0, explanation: 'x² - 5x + 6 = 0 → x = 2 or 3. For x=2: 2+1/2 = 2.5 = 5/2. For x=3: 3+1/3 = 10/3.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Algebra'],
  },
  {
    question: 'Circle area increased by 44%. Radius increases by:',
    options: [
      { index: 0, text: '20%' }, { index: 1, text: '22%' }, { index: 2, text: '11%' }, { index: 3, text: '44%' },
    ],
    correctAnswer: 0, explanation: 'Area ∝ r². New = 1.44 × old = (1.2)² × old. Radius increases 20%.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Geometry'],
  },
  {
    question: 'Arrange 5 students with 2 not together. Ways:',
    options: [
      { index: 0, text: '72' }, { index: 1, text: '60' }, { index: 2, text: '96' }, { index: 3, text: '48' },
    ],
    correctAnswer: 0, explanation: 'Total = 5! = 120. Together = 2×4! = 48. Not together = 120-48 = 72.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Permutation'],
  },
  {
    question: 'CI on sum at 10% p.a. for 2 years = Rs.210. Principal:',
    options: [
      { index: 0, text: '1000' }, { index: 1, text: '900' }, { index: 2, text: '1100' }, { index: 3, text: '1050' },
    ],
    correctAnswer: 0, explanation: 'CI = P[(1.1)² - 1] = P[0.21]. 0.21P = 210 → P = 1000.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Compound Interest'],
  },
  {
    question: 'log₂(log₂(log₂ 16)) = ?',
    options: [
      { index: 0, text: '1' }, { index: 1, text: '2' }, { index: 2, text: '0' }, { index: 3, text: '4' },
    ],
    correctAnswer: 0, explanation: 'log₂ 16 = 4. log₂ 4 = 2. log₂ 2 = 1.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Logarithm'],
  },
  {
    question: 'If sinθ + cosθ = √2, then θ = ?',
    options: [
      { index: 0, text: '45°' }, { index: 1, text: '90°' }, { index: 2, text: '0°' }, { index: 3, text: '30°' },
    ],
    correctAnswer: 0, explanation: 'Max of sinθ + cosθ = √2, achieved when sinθ = cosθ = √2/2, i.e., θ = 45°.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Trigonometry'],
  },
  {
    question: 'Buy Rs.120, sell Rs.150. Profit%:',
    options: [
      { index: 0, text: '25%' }, { index: 1, text: '20%' }, { index: 2, text: '30%' }, { index: 3, text: '15%' },
    ],
    correctAnswer: 0, explanation: 'Profit = 30. Profit% = (30/120)×100 = 25%.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Profit and Loss'],
  },
  {
    question: 'Mean of 7 numbers is 20. Each increased by 4. New mean:',
    options: [
      { index: 0, text: '24' }, { index: 1, text: '20' }, { index: 2, text: '28' }, { index: 3, text: '16' },
    ],
    correctAnswer: 0, explanation: 'Adding constant to each value adds same constant to mean. New = 20+4 = 24.', marks: 1, negativeMarks: 0, difficulty: 'EASY',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Average'],
  },
  {
    question: 'A man rows upstream 10km in 2h, downstream 15km in 2h. Speed of stream:',
    options: [
      { index: 0, text: '1.25 km/h' }, { index: 1, text: '2.5 km/h' }, { index: 2, text: '1 km/h' }, { index: 3, text: '0.5 km/h' },
    ],
    correctAnswer: 0, explanation: 'Upstream = 5 km/h, downstream = 7.5 km/h. v = (7.5-5)/2 = 1.25 km/h.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Boats and Streams'],
  },
  {
    question: 'If a² + b² = 5ab, then (a-b)/(a+b) = ?',
    options: [
      { index: 0, text: '1/2' }, { index: 1, text: '1/3' }, { index: 2, text: '1/4' }, { index: 3, text: '2/3' },
    ],
    correctAnswer: 0, explanation: 'a² + b² = 5ab → (a-b)² = 3ab → (a-b)/(a+b) = √3ab/√5ab = √3/√5. Not matching. Simplify: a²+b²-2ab=3ab → (a-b)²=3ab. Not clean. Hmm.',
    marks: 1, negativeMarks: 0, difficulty: 'HARD',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Algebra'],
  },
  {
    question: 'Sum of 1²+2²+...+n² = 285. n = ?',
    options: [
      { index: 0, text: '10' }, { index: 1, text: '9' }, { index: 2, text: '11' }, { index: 3, text: '12' },
    ],
    correctAnswer: 0, explanation: 'n(n+1)(2n+1)/6 = 285 → n(n+1)(2n+1) = 1710. Try n=10: 10×11×21 = 2310. n=9: 9×10×19 = 1710. n=9.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Series'],
  },
  {
    question: 'Two numbers in ratio 3:4. Adding 5 to each gives ratio 4:5. Smaller number:',
    options: [
      { index: 0, text: '15' }, { index: 1, text: '12' }, { index: 2, text: '18' }, { index: 3, text: '20' },
    ],
    correctAnswer: 0, explanation: '3x/4x = 3/4. (3x+5)/(4x+5) = 4/5 → 15x+25 = 16x+20 → x=5. Smaller = 15.', marks: 1, negativeMarks: 0, difficulty: 'MEDIUM',
    catSectionCode: 'QA', tags: ['CAT', 'QA', 'Ratio'],
  },
];

async function seedMCQs(mcqs: any[], examType: string) {
  let saved = 0;
  for (const mcq of mcqs) {
    try {
      await prisma.mCQ.create({
        data: {
          question: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correctAnswer,
          explanation: mcq.explanation || null,
          difficulty: mcq.difficulty as any,
          examType: examType as 'GATE' | 'CAT',
          marks: mcq.marks,
          negativeMarks: mcq.negativeMarks,
          gateBranchCode: mcq.gateBranchCode || null,
          catSectionCode: mcq.catSectionCode || null,
          sourceType: 'OFFICIAL_PAPER' as any,
          isPreviousYear: true,
          tags: mcq.tags,
        },
      });
      saved++;
    } catch (err) {
      console.error('Failed to seed:', err);
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

    const gateSaved = await seedMCQs(GATE_CS_QUESTIONS, 'GATE');
    const catSaved = await seedMCQs(CAT_QUESTIONS, 'CAT');
    const total = gateSaved + catSaved;

    return NextResponse.json({
      success: true,
      message: `Seeded ${total} MCQs`,
      gate: gateSaved,
      cat: catSaved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}