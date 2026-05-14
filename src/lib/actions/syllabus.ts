'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Official GATE CSE Syllabus Data (simplified structure based on official IITR syllabus)
export const GATE_CSE_UNITS = [
  {
    unit: 'Engineering Mathematics',
    topics: [
      'Discrete Mathematics: Propositional and first order logic, Sets, Relations, Functions, Partial orders, Lattices, Groups, Graph theory, Connectivity, Matching, Coloring',
      'Linear Algebra: Matrices, Determinants, System of linear equations, Eigenvalues and eigenvectors, Rank, LU decomposition',
      'Calculus: Limits, Continuity, Differentiability, Mean value theorem, Integration, Taylor series, Maxima and minima',
      'Probability and Statistics: Random variables, Distributions (uniform, normal, exponential, Poisson, binomial), Mean, Variance, Conditional probability, Bayes theorem',
      'Numerical Methods: Solution of linear and non-linear equations, Interpolation, Numerical integration, Numerical differentiation',
    ],
  },
  {
    unit: 'Digital Logic',
    topics: [
      'Number representation: Binary, Hexadecimal, Two\'s complement, Floating point',
      'Boolean algebra: Minimization (Karnaugh map, Quine-McCluskey), Logic gates, NAND, NOR, XOR gates',
      'Combinational circuits: Adders, Subtractors, Multiplexers, Demultiplexers, Encoders, Decoders, PLA, PAL',
      'Sequential circuits: Latches, Flip-flops (SR, JK, D, T), Counters, Registers, State machines',
      'CMOS: Basics, Fan-in, Fan-out, Power dissipation, Noise margins',
    ],
  },
  {
    unit: 'Computer Organization and Architecture',
    topics: [
      'Machine instructions and addressing modes, ALU, Data path and control unit, Pipelining ( Hazards, Stall detection)',
      'Memory hierarchy: Cache (mapping, replacement policies), Main memory, Virtual memory, MMU',
      'I/O: Polling, Interrupt, DMA, I/O channels',
      'Instruction set architectures: RISC vs CISC, Instruction formats, Addressing modes',
      'Performance: CPI, MIPS, Amdahl\'s law, Speedup factors',
    ],
  },
  {
    unit: 'Data Structures',
    topics: [
      'Arrays: Static and dynamic allocation, Row-major and column-major order, Sparse matrices',
      'Linked lists: Singly, Doubly, Circular, Linked list vs array trade-offs',
      'Stacks and Queues: Array and linked implementation, Applications (expression evaluation, recursion)',
      'Trees: Binary tree, BST, AVL, Red-Black, B-tree, B+ tree, Tree traversals (inorder, preorder, postorder, level order)',
      'Heaps: Min-heap, Max-heap, Heap sort, Priority queue implementation',
      'Graphs: Representation (adjacency matrix, adjacency list), BFS, DFS, Topological sort, Shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall), MST (Prim, Kruskal)',
      'Hashing: Hash functions, Collision resolution (chaining, open addressing), Load factor, Rehashing',
      'Sorting: Comparison based (bubble, selection, insertion, merge, heap, quick), Counting sort, Radix sort, Bucket sort',
      'Searching: Linear search, Binary search, Ternary search',
    ],
  },
  {
    unit: 'Algorithms',
    topics: [
      'Asymptotic analysis: Big-O, Omega, Theta, Space and time complexity, Best/worst/average case',
      'Divide and conquer: Merge sort, Quick sort, Binary search, Closest pair, Strassen matrix multiplication',
      'Greedy: Activity selection, Fractional knapsack, Huffman coding, Minimum spanning tree (Prim, Kruskal), Dijkstra',
      'Dynamic Programming: Fibonacci, 0/1 knapsack, Longest common subsequence, Edit distance, Matrix chain multiplication, Travelling salesman',
      'Backtracking: N-Queens, Hamiltonian cycle, Graph coloring',
      'NP-completeness: P vs NP, NP-complete problems (SAT, Vertex cover, Clique, Hamilton cycle), Approximation algorithms',
    ],
  },
  {
    unit: 'Theory of Computation',
    topics: [
      'Regular languages: DFA, NFA, Regular expressions, Pumping lemma, Closure properties',
      'Context-free languages: CFG, PDA, Chomsky normal form, Greibach normal form, Pumping lemma for CFL',
      'Turing machines: TM as acceptor, TM as transducer, Recursively enumerable languages, Undecidability (Halting problem, Rice theorem)',
      'Automata: Mealy and Moore machines, Minimization of DFA',
      'Undecidability: PCP, Reducibility between problems',
    ],
  },
  {
    unit: 'Operating System',
    topics: [
      'Processes: PCB, Process states, Process scheduling, Context switching, Fork, Exec, Wait, Exit',
      'Threads: User level and kernel level threads, Multithreading models, Thread libraries',
      'CPU Scheduling: FCFS, SJF, Round Robin, Priority, Multilevel queue, Real-time scheduling',
      'Concurrency: Race condition, Critical section, Mutex, Semaphore, Monitor, Dining philosophers, Bakery algorithm',
      'Deadlock: Necessary conditions, Resource allocation graph, Banker\'s algorithm, Deadlock detection and recovery',
      'Memory Management: Contiguous allocation (fixed, variable), Paging, Segmentation, Virtual memory, Page replacement (FIFO, LRU, Optimal), Thrashing',
      'File systems: File organization, Directory structure, File allocation methods (contiguous, linked, indexed), Disk scheduling (FCFS, SSTF, SCAN, C-SCAN)',
    ],
  },
  {
    unit: 'Database Management Systems',
    topics: [
      'ER Model: Entities, Attributes, Relationships, Cardinality, Participation, Weak entities, Generalization, Specialization',
      'Relational model: Schema, Keys (primary, foreign, candidate), Integrity constraints',
      'Normalization: 1NF, 2NF, 3NF, BCNF, Lossless decomposition, Dependency preserving',
      'SQL: DDL, DML, DCL, Queries (select, join, aggregate, subquery, correlated subquery), Views, Triggers',
      'Transactions: ACID properties, Transaction states, Serializability (conflict, view), Recoverability, Isolation levels',
      'Concurrency control: Lock-based (2PL, strict 2PL), Timestamp-based, Deadlock handling',
      'Indexing: B-tree, B+ tree, Clustered vs non-clustered, Primary and secondary indices',
    ],
  },
  {
    unit: 'Computer Networks',
    topics: [
      'Network models: OSI and TCP/IP layers, Protocols at each layer',
      'Physical layer: Transmission media, Analog and digital signals, Bandwidth, Transmission impairments, Switching (circuit, packet, message)',
      'Data link layer: Framing, Error detection (parity, CRC, checksum), Flow control (stop-and-wait, sliding window), MAC addresses, Ethernet, PPP',
      'Network layer: IP addressing (IPv4, IPv6), Subnetting, CIDR, Routing algorithms (Dijkstra, Bellman-Ford, distance vector, link state), RIP, OSPF, BGP, NAT, DHCP',
      'Transport layer: TCP (three-way handshake, flow control, congestion control), UDP, Socket programming',
      'Application layer: DNS, HTTP, HTTPS, FTP, SMTP, POP3, IMAP, SNMP',
      'Network security: Cryptography (symmetric, asymmetric), Digital signatures, Certificates, Firewalls, IDS',
    ],
  },
];

// CAT Syllabus structure
export const CAT_SECTIONS = [
  {
    section: 'Quantitative Ability',
    topics: [
      'Number System: Factors, Factorials, Base system, Divisibility rules',
      'Arithmetic: Percentages, Profit & Loss, Simple & Compound Interest, Ratio & Proportion, Time & Work, Time & Distance',
      'Algebra: Linear equations, Quadratic equations, Inequalities, Functions, Logarithms',
      'Geometry: Triangles, Circles, Quadrilaterals, Coordinate geometry, Mensuration',
      'Modern Math: Permutations & Combinations, Probability, Sets & Venn diagrams',
    ],
  },
  {
    section: 'Verbal Ability',
    topics: [
      'Reading Comprehension: Passages on varied topics, Inference based questions',
      'Grammar: Sentence correction, Subject-verb agreement, Tenses, Articles',
      'Vocabulary: Synonyms, Antonyms, Analogies, Word usage',
      'Para jumbles: Logical ordering of sentences',
      'Critical reasoning: Arguments, Assumption, Conclusion, Strengthen/Weaken',
    ],
  },
  {
    section: 'Data Interpretation & Logical Reasoning',
    topics: [
      'Data Interpretation: Tables, Bar graphs, Line graphs, Pie charts, Caselets',
      'Logical Reasoning: Arrangements, Puzzles, Cubes, Venn diagrams, Binary logic',
      'Series: Number series, Alphabet series',
      'Coding-Decoding: Letter and number based coding',
      'Blood relations, Direction sense, Order and ranking',
    ],
  },
];

export async function createOfficialSyllabus(data: {
  subjectId: string;
  examType: 'GATE' | 'CAT' | 'SEMESTER' | 'UNIVERSITY';
  branch?: string;
}) {
  const { subjectId, examType, branch } = data;

  let syllabusData: { unit: string; topics: string[] }[] = [];

  if (examType === 'GATE' && branch === 'CSE') {
    syllabusData = GATE_CSE_UNITS;
  } else if (examType === 'CAT') {
    syllabusData = CAT_SECTIONS.map(s => ({
      unit: s.section,
      topics: s.topics,
    }));
  }

  // Create syllabus
  const syllabus = await prisma.syllabus.create({
    data: {
      title: `Official ${examType} ${branch || ''} Syllabus`,
      description: `Complete ${examType} syllabus for competitive exam preparation`,
      subjectId,
      sourceType: 'PASTED_TEXT',
      isPublished: true,
    },
  });

  // Create units and topics
  for (let i = 0; i < syllabusData.length; i++) {
    const unit = syllabusData[i];
    const createdUnit = await prisma.unit.create({
      data: {
        title: unit.unit,
        order: i + 1,
        syllabusId: syllabus.id,
      },
    });

    for (let j = 0; j < unit.topics.length; j++) {
      await prisma.topic.create({
        data: {
          title: unit.topics[j],
          order: j + 1,
          unitId: createdUnit.id,
        },
      });
    }
  }

  return syllabus;
}

export async function getSyllabusWithProgress(syllabusId: string, userId: string) {
  const syllabus = await prisma.syllabus.findUnique({
    where: { id: syllabusId },
    include: {
      subject: {
        include: {
          semester: {
            include: {
              branch: true,
            },
          },
        },
      },
      units: {
        orderBy: { order: 'asc' },
        include: {
          topics: {
            orderBy: { order: 'asc' },
            include: {
              topicProgress: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  return syllabus;
}

export async function getAllSyllabiWithFilters(options: {
  branchId?: string;
  semesterId?: string;
  examType?: string;
  isPublished?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (options.isPublished !== undefined) {
    where.isPublished = options.isPublished;
  }

  if (options.examType || options.semesterId || options.branchId) {
    const subjectFilter: Record<string, unknown> = {};
    if (options.examType) subjectFilter.examType = options.examType;
    if (options.semesterId) subjectFilter.semesterId = options.semesterId;
    if (options.branchId) subjectFilter.semester = { branchId: options.branchId };
    where.subject = subjectFilter;
  }

  const syllabi = await prisma.syllabus.findMany({
    where,
    include: {
      subject: {
        include: {
          semester: {
            include: {
              branch: true,
            },
          },
        },
      },
      units: {
        include: {
          _count: {
            select: { topics: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return syllabi;
}

export async function updateSyllabusPublishStatus(syllabusId: string, isPublished: boolean) {
  const syllabus = await prisma.syllabus.update({
    where: { id: syllabusId },
    data: { isPublished },
  });

  revalidatePath('/admin');
  return syllabus;
}

export async function deleteSyllabus(syllabusId: string) {
  await prisma.syllabus.delete({
    where: { id: syllabusId },
  });

  revalidatePath('/admin');
}

export async function createSyllabusWithData(data: {
  subjectId: string;
  title: string;
  description?: string;
  units: { title: string; topics: string[] }[];
}) {
  const syllabus = await prisma.syllabus.create({
    data: {
      title: data.title,
      description: data.description,
      subjectId: data.subjectId,
      isPublished: false,
    },
  });

  for (let i = 0; i < data.units.length; i++) {
    const unit = await prisma.unit.create({
      data: {
        title: data.units[i].title,
        order: i + 1,
        syllabusId: syllabus.id,
      },
    });

    for (let j = 0; j < data.units[i].topics.length; j++) {
      await prisma.topic.create({
        data: {
          title: data.units[i].topics[j],
          order: j + 1,
          unitId: unit.id,
        },
      });
    }
  }

  return syllabus;
}