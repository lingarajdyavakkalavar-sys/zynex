export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  examType: string;
  branch: string;
  semester: number;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  completed: boolean;
  subtopics?: string[];
}

export interface Syllabus {
  id: string;
  subject: string;
  branch: string;
  semester: number;
  topics: SyllabusTopic[];
  progress: number;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface StudySession {
  id: string;
  date: Date;
  duration: number;
  topic: string;
  subject: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
}

export interface StudyPlan {
  id: string;
  examDate: Date;
  dailyHours: number;
  subjects: string[];
  progress: number;
  dailyTarget: number;
  monthlyQuota: number;
}

export interface BacklogItem {
  id: string;
  subject: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
}