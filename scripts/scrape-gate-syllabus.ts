import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GATE_BRANCHES = [
  { code: 'CS', name: 'Computer Science and Information Technology', fullName: 'Computer Science & Information Technology (CS)' },
  { code: 'EC', name: 'Electronics and Communications Engineering', fullName: 'Electronics & Communication Engineering (EC)' },
  { code: 'EE', name: 'Electrical Engineering', fullName: 'Electrical Engineering (EE)' },
  { code: 'ME', name: 'Mechanical Engineering', fullName: 'Mechanical Engineering (ME)' },
  { code: 'CE', name: 'Civil Engineering', fullName: 'Civil Engineering (CE)' },
  { code: 'CH', name: 'Chemical Engineering', fullName: 'Chemical Engineering (CH)' },
  { code: 'BT', name: 'Biotechnology', fullName: 'Biotechnology (BT)' },
  { code: 'IN', name: 'Instrumentation Engineering', fullName: 'Instrumentation Engineering (IN)' },
  { code: 'MA', name: 'Mathematics', fullName: 'Mathematics (MA)' },
  { code: 'PH', name: 'Physics', fullName: 'Physics (PH)' },
  { code: 'CY', name: 'Chemistry', fullName: 'Chemistry (CY)' },
  { code: 'AE', name: 'Aerospace Engineering', fullName: 'Aerospace Engineering (AE)' },
  { code: 'AG', name: 'Agricultural Engineering', fullName: 'Agricultural Engineering (AG)' },
  { code: 'PI', name: 'Production and Industrial Engineering', fullName: 'Production & Industrial Engineering (PI)' },
  { code: 'MT', name: 'Metallurgical Engineering', fullName: 'Metallurgical Engineering (MT)' },
  { code: 'MN', name: 'Mining Engineering', fullName: 'Mining Engineering (MN)' },
  { code: 'TL', name: 'Textile Engineering', fullName: 'Textile Engineering and Fibre Science (TF)' },
  { code: 'FT', name: 'Food Technology', fullName: 'Food Technology (FT)' },
  { code: 'XE', name: 'Engineering Sciences', fullName: 'Engineering Sciences (XE)' },
  { code: 'ES', name: 'Environmental Science and Engineering', fullName: 'Environmental Science & Engineering (ES)' },
  { code: 'GG', name: 'Geology and Geophysics', fullName: 'Geology and Geophysics (GG)' },
  { code: 'AR', name: 'Architecture and Planning', fullName: 'Architecture and Planning (AR)' },
  { code: 'PE', name: 'Petroleum Engineering', fullName: 'Petroleum Engineering (PE)' },
  { code: 'NN', name: 'Naval Architecture and Marine Engineering', fullName: 'Naval Architecture & Marine Engineering (NM)' },
];

const GATE_CS_SUBJECTS = [
  {
    code: 'MA',
    name: 'Engineering Mathematics',
    topics: [
      'Linear Algebra: Matrix algebra, Systems of linear equations, Eigenvalues and eigenvectors',
      'Calculus: Functions of single variable, Limit, continuity and differentiability, Taylor series',
      'Differential Equations: First order equations, Higher order linear differential equations',
      'Complex Variables: Analytic functions, Cauchy-Riemann equations, Integral theorems',
      'Probability and Statistics: Conditional probability, Bayes theorem, Random variables',
      'Numerical Methods: Solution of linear and nonlinear equations, Numerical integration',
    ],
  },
  {
    code: 'DS',
    name: 'Digital Logic',
    topics: [
      'Boolean algebra, Combinational and sequential circuits',
      'Minimization, Number representations, Computer arithmetic',
      'Logic gates, Flip-flops, Registers, Counters',
      'Mux/Demux, A/D and D/A converters',
      'Memory and programmable logic device design',
    ],
  },
  {
    code: 'COA',
    name: 'Computer Organization and Architecture',
    topics: [
      'Machine instructions and addressing modes',
      'ALU, Data path and control unit, Instruction pipelining',
      'Memory hierarchy: cache, main memory and secondary storage',
      'I/O interface: interrupt and DMA mode',
      'Instruction set architectures, RISC and CISC',
      'Parallel processing concepts, Multicore processors',
    ],
  },
  {
    code: 'PDS',
    name: 'Programming and Data Structures',
    topics: [
      'Programming in C, Recursion, Arrays and strings',
      'Stacks, Queues, Linked lists, Trees, Graphs',
      'Sorting and searching algorithms, Hash tables',
      'Dynamic programming, Divide and conquer',
      'Time complexity, Space complexity, Big-O notation',
      'Pointers, Structures, Unions, File handling',
    ],
  },
  {
    code: 'AL',
    name: 'Algorithms',
    topics: [
      'Asymptotic analysis, Best/worst/average case',
      'Recurrence relations, Divide and conquer',
      'Sorting: Bubble, Insertion, Selection, Merge, Quick, Heap',
      'Searching: Linear, Binary, Hash search',
      'Graph algorithms: BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall',
      'Dynamic programming, Greedy algorithms, NP-completeness',
      'Time and space complexity, Correctness of algorithms',
    ],
  },
  {
    code: 'TOC',
    name: 'Theory of Computation',
    topics: [
      'Regular expressions and finite automata',
      'Context-free grammars and pushdown automata',
      'Turing machines and undecidability',
      'Pumping lemma, Closure properties',
      'Chomsky hierarchy, CFL pumping lemma',
      'Reduction techniques, Rice theorem',
    ],
  },
  {
    code: 'CD',
    name: 'Compiler Design',
    topics: [
      'Lexical analysis, Parsing, Syntax-directed translation',
      'Semantic analysis, Intermediate code generation',
      'Code generation, Code optimization',
      'LL and LR parsers, Bottom-up parsing',
      'Symbol table, Runtime environments',
      'Local optimizations, Data flow analysis',
    ],
  },
  {
    code: 'OS',
    name: 'Operating Systems',
    topics: [
      'Processes, Threads, CPU scheduling',
      'Synchronization, Deadlock, Memory management',
      'Virtual memory, Paging, Segmentation',
      'File systems, I/O systems, Protection',
      'Process management: creation, termination, communication',
      'Classical synchronization problems, Semaphores, Monitors',
      'Scheduling algorithms, Page replacement algorithms',
    ],
  },
  {
    code: 'DB',
    name: 'Databases',
    topics: [
      'ER model, Relational model, SQL',
      'Dependencies, Normalization (1NF, 2NF, 3NF, BCNF)',
      'Query processing, Transaction management',
      'Concurrency control, Indexing, B-trees, B+ trees',
      'File organization, RAID concepts',
      'Query optimization, Trigger, Stored procedures',
    ],
  },
  {
    code: 'CN',
    name: 'Computer Networks',
    topics: [
      'Network models: OSI, TCP/IP',
      'Data link layer: Framing, Error detection, Flow control',
      'Network layer: Routing algorithms, IP, ICMP',
      'Transport layer: TCP, UDP, Congestion control',
      'Application layer: DNS, HTTP, FTP, SMTP',
      'Switching, LAN technologies, Wireless networking',
      'Network security: Cryptography, Firewalls, VPNs',
    ],
  },
  {
    code: 'GA',
    name: 'General Aptitude',
    topics: [
      'Verbal ability: English grammar, Vocabulary, Comprehension',
      'Numerical ability: Number system, Averages, Percentages',
      'Reasoning: Logic puzzles, Data interpretation',
      'Spatial reasoning, Analytical reasoning',
    ],
  },
];

const GATE_CS_PAPERS = [
  { year: 2024, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2024, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
  { year: 2023, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2023, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
  { year: 2022, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2022, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
  { year: 2021, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2021, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
  { year: 2020, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2020, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
  { year: 2019, session: 'Forenoon', paperCode: 'CS1', setCode: 'A' },
  { year: 2019, session: 'Afternoon', paperCode: 'CS2', setCode: 'A' },
];

async function seedGATE() {
  console.log('Seeding GATE branches...');
  for (const branch of GATE_BRANCHES) {
    await prisma.gATEBranch.upsert({
      where: { code: branch.code },
      update: { name: branch.name, fullName: branch.fullName },
      create: { code: branch.code, name: branch.name, fullName: branch.fullName },
    });
  }
  console.log(`Created ${GATE_BRANCHES.length} GATE branches`);

  const csBranch = await prisma.gATEBranch.findUnique({ where: { code: 'CS' } });
  if (!csBranch) {
    throw new Error('CS branch not found');
  }

  console.log('Seeding GATE CS subjects and topics...');
  for (let i = 0; i < GATE_CS_SUBJECTS.length; i++) {
    const subject = GATE_CS_SUBJECTS[i];
    const gateSubject = await prisma.gATESubject.upsert({
      where: { code_branchId: { code: subject.code, branchId: csBranch.id } },
      update: { name: subject.name, order: i },
      create: { code: subject.code, name: subject.name, branchId: csBranch.id, order: i },
    });

    for (let j = 0; j < subject.topics.length; j++) {
      await prisma.gATETopic.upsert({
        where: { id: `cs-${subject.code}-${j + 1}` },
        update: { title: subject.topics[j], order: j + 1 },
        create: {
          id: `cs-${subject.code}-${j + 1}`,
          title: subject.topics[j],
          order: j + 1,
          subjectId: gateSubject.id,
          branchId: csBranch.id,
        },
      });
    }
    console.log(`  Created subject: ${subject.name} with ${subject.topics.length} topics`);
  }

  console.log('Seeding GATE CS question papers...');
  for (const paper of GATE_CS_PAPERS) {
    await prisma.gATEPaper.upsert({
      where: { year_paperCode_setCode: { year: paper.year, paperCode: paper.paperCode, setCode: paper.setCode } },
      update: {},
      create: {
        year: paper.year,
        session: paper.session,
        paperCode: paper.paperCode,
        branchId: csBranch.id,
        setCode: paper.setCode,
        isOfficial: true,
        totalMarks: 100,
        duration: 180,
      },
    });
  }
  console.log(`Created ${GATE_CS_PAPERS.length} GATE CS papers`);

  console.log('\nGATE seeding completed successfully!');
}

seedGATE()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());