'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Calculator, ChevronLeft, ChevronRight, Flag, Bookmark, Pause, Play, 
  Eye, EyeOff, CheckCircle, XCircle, AlertCircle, HelpCircle, ArrowLeft,
  BarChart3, Target, Award, Timer, ChevronDown, ChevronUp, BookOpen, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  options: { index: number; text: string }[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  questionType: string;
  difficulty: string;
  gateTopicId?: string;
  year?: number;
  paperCode?: string;
}

interface Attempt {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  isMarkedForReview: boolean;
  timeSpent: number;
}

const GATE_PATTERN = {
  totalQuestions: 65,
  sections: [
    { name: 'General Aptitude', questions: 10, marks: 15, eachMarks: 1.5 },
    { name: 'Technical', questions: 55, marks: 85, eachMarks: '1 or 2' },
  ],
  negativeMarking: { '1': 0.33, '2': 0.66 },
  duration: 180,
};

export default function GateTestPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [testMode, setTestMode] = useState<'setup' | 'test' | 'analysis' | 'calculator'>('setup');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState('CS');
  const [mode, setMode] = useState<'full' | 'sectional' | 'practice'>('full');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Demo mode - allow access without auth
  }, []);

  useEffect(() => {
    if (testMode === 'test' && timeRemaining > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current ?? undefined);
  }, [testMode, isPaused, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTest = async () => {
    try {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: 'GATE',
          mode: mode,
          year: selectedYear ? parseInt(selectedYear) : undefined,
          branchCode: selectedBranch,
          totalQuestions: 65,
          duration: 180 * 60,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setSessionId(data.session?.id || null);
        } else {
          const fallback = generateMockQuestions(65);
          setQuestions(fallback);
        }
      } else {
        const fallback = generateMockQuestions(65);
        setQuestions(fallback);
      }
    } catch (e) {
      const fallback = generateMockQuestions(65);
      setQuestions(fallback);
    }

    setTestMode('test');
    setTimeRemaining(180 * 60);
  };

  const generateMockQuestions = (count: number): Question[] => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const isGA = i < 10;
      const marks = isGA ? 1 : (Math.random() > 0.3 ? 1 : 2);
      questions.push({
        id: `q-${i}`,
        question: `Sample Question ${i + 1} - ${isGA ? 'General Aptitude' : 'Technical'} (${marks} mark${marks > 1 ? 's' : ''})`,
        options: [
          { index: 0, text: `Option A for question ${i + 1}` },
          { index: 1, text: `Option B for question ${i + 1}` },
          { index: 2, text: `Option C for question ${i + 1}` },
          { index: 3, text: `Option D for question ${i + 1}` },
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: 'This is a sample explanation for the answer.',
        marks,
        negativeMarks: marks === 1 ? 0.33 : 0.66,
        questionType: 'MCQ',
        difficulty: 'MEDIUM',
        year: selectedYear ? parseInt(selectedYear) : 2024,
        paperCode: selectedBranch,
      });
    }
    return questions;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const q = questions[currentQuestion];
    setAttempts(prev => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        questionId: q.id,
        selectedAnswer: answerIndex,
        isCorrect: answerIndex === q.correctAnswer,
        isMarkedForReview: prev[q.id]?.isMarkedForReview || false,
        timeSpent: (prev[q.id]?.timeSpent || 0) + 1,
      },
    }));
  };

  const toggleMarkForReview = () => {
    const q = questions[currentQuestion];
    setAttempts(prev => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        questionId: q.id,
        selectedAnswer: prev[q.id]?.selectedAnswer ?? null,
        isCorrect: null,
        isMarkedForReview: !prev[q.id]?.isMarkedForReview,
        timeSpent: prev[q.id]?.timeSpent || 0,
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    clearInterval(timerRef.current ?? undefined);

    const stats = calculateStats();

    if (sessionId) {
      try {
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            attempts: Object.values(attempts),
            obtainedMarks: stats.obtainedMarks,
            negativeMarks: stats.negativeMarks,
            correctCount: stats.correct,
            wrongCount: stats.wrong,
            unattempted: stats.unattempted,
          }),
        });
      } catch (e) {
        console.log('Demo mode');
      }
    }

    setTestMode('analysis');
  };

  const calculateStats = () => {
    let correct = 0, wrong = 0, unattempted = 0;
    let obtainedMarks = 0, negativeMarks = 0;
    let totalMarks = 0;

    questions.forEach(q => {
      const attempt = attempts[q.id];
      totalMarks += q.marks;

      if (attempt?.selectedAnswer !== null && attempt?.selectedAnswer !== undefined) {
        if (attempt.isCorrect) {
          correct++;
          obtainedMarks += q.marks;
        } else {
          wrong++;
          negativeMarks += q.negativeMarks;
          obtainedMarks -= q.negativeMarks;
        }
      } else {
        unattempted++;
      }
    });

    return { correct, wrong, unattempted, obtainedMarks, negativeMarks, totalMarks };
  };

  const getQuestionStatus = (index: number) => {
    const q = questions[index];
    const attempt = attempts[q.id];

    if (!attempt || (attempt.selectedAnswer === null || attempt.selectedAnswer === undefined)) {
      return 'unattempted';
    }
    if (attempt.isMarkedForReview) {
      return 'marked';
    }
    return 'attempted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attempted': return 'bg-green-500';
      case 'marked': return 'bg-yellow-500';
      case 'unattempted': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isSignedIn) return null;

  if (testMode === 'setup') {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/practice')} className="text-[#8a8a9a]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#0066cc]" />
                    GATE Full Mock Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[#8a8a9a] text-sm">Select Year</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                          <SelectItem value="2024">GATE 2024</SelectItem>
                          <SelectItem value="2023">GATE 2023</SelectItem>
                          <SelectItem value="2022">GATE 2022</SelectItem>
                          <SelectItem value="2021">GATE 2021</SelectItem>
                          <SelectItem value="2020">GATE 2020</SelectItem>
                          <SelectItem value="2019">GATE 2019</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[#8a8a9a] text-sm">Branch</label>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                          <SelectItem value="CS">Computer Science (CS)</SelectItem>
                          <SelectItem value="EC">Electronics & Comm (EC)</SelectItem>
                          <SelectItem value="EE">Electrical (EE)</SelectItem>
                          <SelectItem value="ME">Mechanical (ME)</SelectItem>
                          <SelectItem value="CE">Civil (CE)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-[#1a1a24] rounded-sm p-4 space-y-3">
                    <h3 className="text-white font-medium">Test Pattern</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#0066cc]">65</p>
                        <p className="text-[#8a8a9a] text-xs">Total Questions</p>
                      </div>
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#34a853]">100</p>
                        <p className="text-[#8a8a9a] text-xs">Total Marks</p>
                      </div>
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#fbbc04]">180</p>
                        <p className="text-[#8a8a9a] text-xs">Minutes</p>
                      </div>
                    </div>

                    <div className="text-sm text-[#8a8a9a]">
                      <p className="mb-2">• Section 1: General Aptitude (10 questions, 15 marks)</p>
                      <p className="mb-2">• Section 2: Technical (55 questions, 85 marks)</p>
                      <p>• 1 mark questions: -1/3 for wrong answer</p>
                      <p>• 2 mark questions: -2/3 for wrong answer</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { setMode('full'); handleStartTest(); }} className="flex-1 bg-[#0066cc] hover:bg-[#0052a3]">
                      <Timer className="w-4 h-4 mr-2" />
                      Start Full Test
                    </Button>
                    <Button onClick={() => { setMode('practice'); handleStartTest(); }} variant="outline" className="flex-1 border-[#1f1f2e] text-white hover:bg-[#1a1a24]">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Practice Mode
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Previous Year Papers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[2024, 2023, 2022, 2021, 2020, 2019].map(year => (
                      <Button
                        key={year}
                        variant="outline"
                        onClick={() => { setSelectedYear(year.toString()); setMode('full'); handleStartTest(); }}
                        className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] justify-between"
                      >
                        GATE {year}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  if (testMode === 'analysis') {
    const stats = calculateStats();
    const currentQ = questions[currentQuestion];
    const currentAttempt = attempts[currentQ.id];

    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Post-Exam Analysis</h1>
                <div className="flex gap-3">
                  <Button onClick={() => { setCurrentQuestion(0); setTestMode('test'); setTimeRemaining(0); }} variant="outline" className="border-[#1f1f2e] text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Test
                  </Button>
                  <Button onClick={() => router.push('/practice')} className="bg-[#0066cc] hover:bg-[#0052a3]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Practice
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-[#0066cc]">{stats.obtainedMarks.toFixed(2)}</p>
                    <p className="text-[#8a8a9a] text-sm">Final Score</p>
                    <p className="text-xs text-[#8a8a9a]">out of {stats.totalMarks}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-[#34a853]">{stats.correct}</p>
                    <p className="text-[#8a8a9a] text-sm">Correct</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-[#ea4335]">{stats.wrong}</p>
                    <p className="text-[#8a8a9a] text-sm">Wrong</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-[#8a8a9a]">{stats.unattempted}</p>
                    <p className="text-[#8a8a9a] text-sm">Unattempted</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#fbbc04]">-{stats.negativeMarks.toFixed(2)}</p>
                    <p className="text-[#8a8a9a] text-sm">Negative Marks</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{Math.round((stats.correct / (stats.correct + stats.wrong || 1)) * 100)}%</p>
                    <p className="text-[#8a8a9a] text-sm">Accuracy</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#9333ea]">{Math.round((180 * 60 - timeRemaining) / 60)} min</p>
                    <p className="text-[#8a8a9a] text-sm">Time Spent</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#0066cc]">{questions.filter(q => attempts[q.id]?.isMarkedForReview).length}</p>
                    <p className="text-[#8a8a9a] text-sm">Marked for Review</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white">Question Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-10 gap-2 mb-6">
                    {questions.map((q, i) => {
                      const status = getQuestionStatus(i);
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestion(i)}
                          className={cn(
                            'h-10 rounded-sm font-medium text-sm transition-colors',
                            currentQuestion === i ? 'ring-2 ring-[#0066cc]' : '',
                            status === 'attempted' ? 'bg-[#34a853] text-white' :
                            status === 'marked' ? 'bg-[#fbbc04] text-black' :
                            'bg-[#1a1a24] text-[#8a8a9a] hover:bg-[#252530]'
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-[#1a1a24] rounded-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#0066cc]/20 text-[#0066cc]">Q{currentQuestion + 1}</Badge>
                        <Badge className={currentQ.marks === 2 ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-[#34a853]/20 text-[#34a853]'}>
                          {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
                        </Badge>
                        {currentAttempt?.isMarkedForReview && (
                          <Badge className="bg-[#ea4335]/20 text-[#ea4335]">
                            <Flag className="w-3 h-3 mr-1" />
                            Marked
                          </Badge>
                        )}
                      </div>
                      {currentAttempt && (
                        <Badge className={currentAttempt.selectedAnswer === currentQ.correctAnswer ? 'bg-[#34a853]/20 text-[#34a853]' : 'bg-[#ea4335]/20 text-[#ea4335]'}>
                          {currentAttempt.selectedAnswer === currentQ.correctAnswer ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {currentAttempt.selectedAnswer === currentQ.correctAnswer ? 'Correct' : 'Wrong'}
                        </Badge>
                      )}
                    </div>

                    <p className="text-white text-lg mb-6">{currentQ.question}</p>

                    <div className="space-y-3 mb-6">
                      {currentQ.options.map(opt => (
                        <div
                          key={opt.index}
                          className={cn(
                            'p-4 rounded-sm border transition-colors',
                            opt.index === currentQ.correctAnswer
                              ? 'border-[#34a853] bg-[#34a853]/10'
                              : opt.index === currentAttempt?.selectedAnswer
                              ? 'border-[#ea4335] bg-[#ea4335]/10'
                              : 'border-[#1f1f2e] hover:border-[#0066cc]/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'w-8 h-8 rounded-sm flex items-center justify-center font-medium',
                              opt.index === currentQ.correctAnswer
                                ? 'bg-[#34a853] text-white'
                                : opt.index === currentAttempt?.selectedAnswer
                                ? 'bg-[#ea4335] text-white'
                                : 'bg-[#1a1a24] text-[#8a8a9a]'
                            )}>
                              {String.fromCharCode(65 + opt.index)}
                            </span>
                            <span className="text-white flex-1">{opt.text}</span>
                            {opt.index === currentQ.correctAnswer && <CheckCircle className="w-5 h-5 text-[#34a853]" />}
                            {opt.index === currentAttempt?.selectedAnswer && opt.index !== currentQ.correctAnswer && <XCircle className="w-5 h-5 text-[#ea4335]" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#1f1f2e] pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-[#0066cc]" />
                        <span className="text-white font-medium">Explanation</span>
                      </div>
                      <p className="text-[#8a8a9a]">{currentQ.explanation || 'No explanation available.'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="border-[#1f1f2e] text-white">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button variant="outline" onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="border-[#1f1f2e] text-white">
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAttempt = attempts[currentQ?.id];
  const answeredCount = Object.values(attempts).filter(a => a?.selectedAnswer !== null && a?.selectedAnswer !== undefined).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      <header className="h-16 bg-[#0a0a0f] border-b border-[#1f1f2e] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#0066cc]" />
            <span className="text-white font-semibold">GATE Mock Test</span>
          </div>
          <Badge className="bg-[#1a1a24] text-white">{selectedBranch} | {selectedYear || 'Mock'}</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-lg',
            timeRemaining < 300 ? 'bg-[#ea4335]/20 text-[#ea4335]' : 'bg-[#1a1a24] text-white'
          )}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>

          <Button variant="ghost" onClick={() => setIsPaused(!isPaused)} className="text-[#8a8a9a]">
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>

          <Button variant="ghost" onClick={() => setShowCalculator(!showCalculator)} className="text-[#8a8a9a]">
            <Calculator className="w-5 h-5" />
          </Button>

          <Button onClick={handleSubmitTest} className="bg-[#34a853] hover:bg-[#2d8f4a]">
            Submit Test
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16 flex">
        {showPalette && (
          <div className="w-72 bg-[#0a0a0f] border-r border-[#1f1f2e] p-4 fixed top-16 bottom-0 left-0 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#8a8a9a] text-sm">Progress</span>
                <span className="text-white text-sm">{answeredCount}/{questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, i) => {
                const status = getQuestionStatus(i);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(i)}
                    className={cn(
                      'h-10 rounded-sm font-medium text-sm transition-colors',
                      currentQuestion === i ? 'ring-2 ring-[#0066cc]' : '',
                      status === 'attempted' ? 'bg-[#34a853] text-white' :
                      status === 'marked' ? 'bg-[#fbbc04] text-black' :
                      'bg-[#1a1a24] text-[#8a8a9a] hover:bg-[#252530]'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-[#8a8a9a] space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#34a853] rounded-sm"></div>
                <span>Answered ({Object.values(attempts).filter(a => a?.selectedAnswer !== null).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#fbbc04] rounded-sm"></div>
                <span>Marked for Review ({Object.values(attempts).filter(a => a?.isMarkedForReview).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#1a1a24] rounded-sm"></div>
                <span>Not Answered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        )}

        <div className={cn('flex-1 p-6', showPalette ? 'pl-80' : '')}>
          {showCalculator && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#0a0a0f] border border-[#1f1f2e] rounded-sm p-6 w-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Calculator</h3>
                  <Button variant="ghost" onClick={() => setShowCalculator(false)} className="text-[#8a8a9a]">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-[#1a1a24] rounded-sm p-4 mb-4">
                  <input type="text" className="w-full bg-transparent text-white text-2xl text-right font-mono outline-none" defaultValue="0" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(key => (
                    <button
                      key={key}
                      className={cn(
                        'h-12 rounded-sm font-medium transition-colors',
                        key === '=' ? 'bg-[#0066cc] text-white' :
                        ['+', '-', '*', '/'].includes(key) ? 'bg-[#1a1a24] text-[#0066cc] hover:bg-[#252530]' :
                        'bg-[#1a1a24] text-white hover:bg-[#252530]'
                      )}
                      onClick={() => {}}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentQ && (
            <motion.div key={currentQ.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#0066cc]/20 text-[#0066cc]">Q{currentQuestion + 1}</Badge>
                      <Badge className={currentQ.marks === 2 ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-[#34a853]/20 text-[#34a853]'}>
                        {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
                      </Badge>
                      {currentAttempt?.isMarkedForReview && (
                        <Badge className="bg-[#ea4335]/20 text-[#ea4335]">
                          <Flag className="w-3 h-3 mr-1" />
                          Marked
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" onClick={toggleMarkForReview} className="text-[#8a8a9a]">
                      <Bookmark className={cn('w-4 h-4 mr-2', currentAttempt?.isMarkedForReview ? 'fill-[#fbbc04] text-[#fbbc04]' : '')} />
                      Mark for Review
                    </Button>
                  </div>

                  <p className="text-white text-lg mb-6">{currentQ.question}</p>

                  <div className="space-y-3">
                    {currentQ.options.map(opt => (
                      <button
                        key={opt.index}
                        onClick={() => handleAnswerSelect(opt.index)}
                        className={cn(
                          'w-full p-4 rounded-sm border text-left transition-all',
                          currentAttempt?.selectedAnswer === opt.index
                            ? 'border-[#0066cc] bg-[#0066cc]/10'
                            : 'border-[#1f1f2e] hover:border-[#0066cc]/30'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'w-8 h-8 rounded-sm flex items-center justify-center font-medium text-sm',
                            currentAttempt?.selectedAnswer === opt.index
                              ? 'bg-[#0066cc] text-white'
                              : 'bg-[#1a1a24] text-[#8a8a9a]'
                          )}>
                            {String.fromCharCode(65 + opt.index)}
                          </span>
                          <span className="text-white">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t border-[#1f1f2e]">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="border-[#1f1f2e] text-white">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button variant="outline" onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="border-[#1f1f2e] text-white">
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowPalette(!showPalette)} className="border-[#1f1f2e] text-white">
                        {showPalette ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      {currentQuestion < questions.length - 1 ? (
                        <Button onClick={handleNext} className="bg-[#0066cc] hover:bg-[#0052a3]">
                          Save & Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={handleSubmitTest} className="bg-[#34a853] hover:bg-[#2d8f4a]">
                          Submit Test
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 text-center text-[#8a8a9a] text-sm">
                Press number keys 1-4 to select answers | Arrow keys to navigate | M to mark for review
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}