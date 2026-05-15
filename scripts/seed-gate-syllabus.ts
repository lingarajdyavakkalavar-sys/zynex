import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GATE_CS_SYLLABUS = {
  branch: { code: 'CS', name: 'Computer Science', fullName: 'Computer Science & Information Technology' },
  subjects: [
    {
      code: 'ENG',
      name: 'Engineering Mathematics',
      topics: [
        'Discrete Mathematics: Propositional and first order logic, Sets, Relations, Functions, Partial orders, Lattices, Groups, Graph theory, Pigeonhole principle, Inclusion-Exclusion principle, Generating functions, Recurrence relations',
        'Linear Algebra: Matrices, Determinants, System of linear equations, Eigenvalues and eigenvectors, Rank, Nullity, Cayley-Hamilton theorem, LU decomposition',
        'Calculus: Limits, Continuity, Differentiability, Mean value theorem, Integration, Taylor series, Multivariable calculus, Partial derivatives, Maxima and minima, Jacobians, Hessians',
        'Probability and Statistics: Random variables, Uniform, Normal, Exponential distributions, Mean, Variance, Conditional probability, Bayes theorem, Binomial, Poisson distributions, Correlation, Regression',
        'Numerical Methods: Newton-Raphson method, Numerical integration, Trapezoidal rule, Simpson rule, LU decomposition, Solution of linear equations'
      ]
    },
    {
      code: 'DL',
      name: 'Digital Logic',
      topics: [
        'Number representation: Binary, Hexadecimal, Octal, Signed numbers, Floating point representation',
        'Boolean algebra: Theorems, Karnaugh maps, Minimization, NAND, NOR gates, XOR, XNOR',
        'Combinational circuits: Adders, Subtractors, Multiplexers, Demultiplexers, Encoders, Decoders, Code converters, Parity generators/checkers',
        'Sequential circuits: Latches, Flip-flops, Counters (synchronous, asynchronous), Registers, State machines, Timing diagrams',
        'Memory: ROM, RAM, Cache memory, Address mapping, Hit ratio, Write policies, Virtual memory, Page tables, TLB'
      ]
    },
    {
      code: 'COA',
      name: 'Computer Organization and Architecture',
      topics: [
        'Machine instructions: Instruction formats, Addressing modes, Instruction execution, Pipeline, Hazards, RISC vs CISC',
        'CPU design: ALU, Control unit, Microprogramming, Pipelining, Multiple issue, Out-of-order execution',
        'Memory hierarchy: Cache organization, Block placement, Replacement policies, Write strategies, Associative memory',
        'I/O: Polling, Interrupts, DMA, Memory-mapped I/O, I/O controllers, Disk scheduling',
        'Performance: CPI, MIPS, Throughput, Latency, Amdahl law, Benchmarking'
      ]
    },
    {
      code: 'DS',
      name: 'Data Structures',
      topics: [
        'Arrays: Row-major, Column-major, Sparse matrix representation, Linked lists (singly, doubly, circular)',
        'Stacks and Queues: Implementation, Applications (infix to postfix, evaluation, recursion), Circular queue, Priority queue',
        'Trees: Binary tree, BST, AVL, Red-Black, B-tree, B+ tree, Tree traversals, Threaded tree',
        'Heaps: Binary heap, Min-heap, Max-heap, Heap sort, Priority queue implementation',
        'Graphs: Representation (adjacency matrix/list), BFS, DFS, Topological sort, Shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall), MST (Prim, Kruskal), Strongly connected components'
      ]
    },
    {
      code: 'ALGO',
      name: 'Algorithms',
      topics: [
        'Asymptotic analysis: Big O, Omega, Theta, Space and time complexity',
        'Sorting: Bubble, Selection, Insertion, Merge, Heap, Quick, Radix, Count sort, Stability',
        'Searching: Linear, Binary, Hashing (open/closed addressing, load factor, rehashing)',
        'Divide and conquer: Merge sort, Quick sort, Binary search, Strassen matrix multiplication, Closest pair',
        'Dynamic programming: Fibonacci, Knapsack, LCS, Edit distance, Matrix chain multiplication, Bellman-Ford, Floyd-Warshall',
        'Greedy: Job sequencing, Fractional knapsack, Huffman coding, Prim, Kruskal, Dijkstra',
        'Graph algorithms: All pair shortest path, Single source shortest path, MST, Topological sort, Hamiltonian cycle',
        'Complexity classes: P, NP, NP-complete, NP-hard, Reductions'
      ]
    },
    {
      code: 'TOC',
      name: 'Theory of Computation',
      topics: [
        'Regular languages: DFA, NFA, Regex, Pumping lemma, Closure properties, Mealy and Moore machines',
        'Context-free languages: CFG, PDA, Chomsky normal form, Greibach normal form, Pumping lemma, Closure properties',
        'Decidability: Turing machine, Church-Turing thesis, Halting problem, Undecidability, Rice theorem',
        'Complexity: P vs NP, NP-complete (SAT, 3-CNF, Vertex cover, Hamiltonian path), Reduction',
        'Formal languages: Types of grammars, Ambiguity, Normal forms'
      ]
    },
    {
      code: 'CD',
      name: 'Compiler Design',
      topics: [
        'Lexical analysis: Tokens, Patterns, Regular expressions, Finite automata, LEX/FLEX',
        'Syntax analysis: Parsing techniques (LL, LR, LALR), Parse trees, AST, Ambiguous grammars',
        'Semantic analysis: Type checking, Symbol table, Attribute grammar, Type conversion',
        'Intermediate code: Three address code, Quadruples, Postfix, DAG representation',
        'Code generation: Register allocation, Peephole optimization, Target code generation',
        'Runtime: Activation records, Memory management, Garbage collection'
      ]
    },
    {
      code: 'OS',
      name: 'Operating Systems',
      topics: [
        'Process: Process control block, States, Scheduling (FCFS, SJF, RR, Priority, Multilevel), Context switch',
        'Threads: User/kernel threads, Thread libraries, Threading issues, Multithreading',
        'Concurrency: Critical section, Synchronization (mutex, semaphore, monitor), Deadlock (prevention, avoidance, detection, recovery), Race condition',
        'Memory: Paging, Segmentation, Virtual memory, Page replacement (FIFO, LRU, Optimal), Thrashing, Frame allocation',
        'File systems: File concepts, Directory structure, File allocation methods (contiguous, linked, indexed), Disk scheduling (FCFS, SSTF, SCAN, C-SCAN), File protection'
      ]
    },
    {
      code: 'DBMS',
      name: 'Database Management Systems',
      topics: [
        'ER model: Entities, Attributes, Relationships, Cardinality, Weak entities, E-R diagrams',
        'Relational model: Schema, Keys (primary, foreign, candidate), Relational algebra, Tuple calculus, SQL',
        'Normalization: 1NF, 2NF, 3NF, BCNF, Lossless/dependency preserving decomposition',
        'Query processing: Query optimization, Execution plans, Indexing (B-tree, B+ tree, Hash)',
        'Transactions: ACID properties, Concurrency control (locking, timestamp, optimistic), Serializability, Recovery (log-based, checkpointing)',
        'NoSQL: CAP theorem, Types (key-value, document, column, graph), MongoDB basics'
      ]
    },
    {
      code: 'CN',
      name: 'Computer Networks',
      topics: [
        'OSI model: Layers, Functions, Protocols, Encapsulation',
        'Physical layer: Transmission media, Encoding (NRZ, Manchester), Switching (circuit, packet, message), Bandwidth, Latency',
        'Data link layer: Framing, Error detection (parity, CRC, checksum), Flow control, MAC protocols (CSMA, ALOHA, Ethernet), Collision detection, MAC addressing',
        'Network layer: IP (IPv4, IPv6), Subnetting, CIDR, Routing algorithms (Dijkstra, Bellman-Ford, Distance vector, Link state), NAT, DHCP, ICMP',
        'Transport layer: TCP (3-way handshake, flow control, congestion control), UDP, Socket programming, Port numbers',
        'Application layer: DNS, HTTP, HTTPS, FTP, SMTP, POP3, IMAP, DHCP, SNMP',
        'Network security: Encryption (symmetric, asymmetric), Digital signatures, Firewalls, SSL/TLS, VPN'
      ]
    }
  ]
};

async function seedGATESyllabus() {
  console.log('Creating GATE CS Branch...');
  
  // Create branch
  const branch = await prisma.gATEBranch.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      code: 'CS',
      name: GATE_CS_SYLLABUS.branch.name,
      fullName: GATE_CS_SYLLABUS.branch.fullName,
    },
  });
  
  console.log(`Branch created: ${branch.id}`);
  
  // Create subjects and topics
  let topicCount = 0;
  
  for (const subject of GATE_CS_SYLLABUS.subjects) {
    console.log(`Creating subject: ${subject.name}...`);
    
    const dbSubject = await prisma.gATESubject.upsert({
      where: { code_branchId: { code: subject.code, branchId: branch.id } },
      update: {},
      create: {
        code: subject.code,
        name: subject.name,
        branchId: branch.id,
        order: GATE_CS_SYLLABUS.subjects.indexOf(subject),
      },
    });
    
    // Parse topics and create them
    const topicLines = subject.topics.join('\n').split('\n');
    let topicOrder = 0;
    
    for (const topicLine of topicLines) {
      if (topicLine.trim()) {
        await prisma.gATETopic.upsert({
          where: { id: `${branch.id}-${subject.code}-${topicOrder}` },
          update: {},
          create: {
            id: `${branch.id}-${subject.code}-${topicOrder}`,
            title: topicLine.trim().split(':')[0].trim(),
            description: topicLine.trim(),
            order: topicOrder,
            branchId: branch.id,
            subjectId: dbSubject.id,
          },
        });
        topicCount++;
        topicOrder++;
      }
    }
    
    console.log(`  Created ${topicOrder} topics for ${subject.name}`);
  }
  
  console.log(`\n✅ GATE CS Syllabus seeded successfully!`);
  console.log(`Total topics created: ${topicCount}`);
}

async function main() {
  try {
    await seedGATESyllabus();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();