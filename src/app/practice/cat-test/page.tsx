'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  Clock, Calculator, ChevronLeft, ChevronRight, Flag, Bookmark, Pause, Play,
  Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Timer, Target, BookOpen, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  options: { index: number; text: string }[];
  correctAnswer: number;
  explanation?: string;
  section: string;
  difficulty: string;
}

interface Attempt {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  isMarkedForReview: boolean;
  timeSpent: number;
}

const CAT_PATTERN = {
  totalQuestions: 66,
  sections: [
    { code: 'VARC', name: 'Verbal Ability and Reading Comprehension', questions: 24, duration: 40 },
    { code: 'DILR', name: 'Data Interpretation and Logical Reasoning', questions: 20, duration: 40 },
    { code: 'QA', name: 'Quantitative Aptitude', questions: 22, duration: 40 },
  ],
  duration: 120,
};

export default function CatTestPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [testMode, setTestMode] = useState<'setup' | 'test' | 'analysis'>('setup');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [mode, setMode] = useState<'full' | 'sectional' | 'practice'>('full');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, Attempt>>({});
  const [timeRemaining, setTimeRemaining] = useState(120 * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSignedIn) router.push('/login');
  }, [isSignedIn, router]);

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

  const generateMockQuestions = (section?: string): Question[] => {
    const questions = [];
    const sectionData = section && section !== 'all' 
      ? CAT_PATTERN.sections.filter(s => s.code === section)
      : CAT_PATTERN.sections;
    
    const totalCount = section === 'all' ? 66 : sectionData[0]?.questions || 20;

    for (let i = 0; i < totalCount; i++) {
      let sectionCode = 'QA';
      if (i < 24) sectionCode = 'VARC';
      else if (i < 44) sectionCode = 'DILR';
      else sectionCode = 'QA';

      questions.push({
        id: `cat-${i}`,
        question: `CAT ${sectionCode} Question ${i + 1}`,
        options: [
          { index: 0, text: `Option A for question ${i + 1}` },
          { index: 1, text: `Option B for question ${i + 1}` },
          { index: 2, text: `Option C for question ${i + 1}` },
          { index: 3, text: `Option D for question ${i + 1}` },
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: 'This is a sample explanation for the CAT question.',
        section: sectionCode,
        difficulty: i % 3 === 0 ? 'HARD' : i % 3 === 1 ? 'MEDIUM' : 'EASY',
      });
    }
    return questions;
  };

  const handleStartTest = () => {
    const q = selectedSection === 'all' ? generateMockQuestions('all') : generateMockQuestions(selectedSection);
    setQuestions(q);
    setTestMode('test');
    setTimeRemaining(selectedSection === 'all' ? 120 * 60 : 40 * 60);
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
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const handleSubmitTest = () => {
    clearInterval(timerRef.current ?? undefined);
    setTestMode('analysis');
  };

  const calculateStats = () => {
    let correct = 0, wrong = 0, unattempted = 0;

    questions.forEach(q => {
      const attempt = attempts[q.id];
      if (attempt?.selectedAnswer !== null && attempt?.selectedAnswer !== undefined) {
        if (attempt.isCorrect) correct++;
        else wrong++;
      } else {
        unattempted++;
      }
    });

    return { correct, wrong, unattempted };
  };

  const getQuestionStatus = (index: number) => {
    const q = questions[index];
    const attempt = attempts[q.id];
    if (!attempt || attempt.selectedAnswer === null) return 'unattempted';
    if (attempt.isMarkedForReview) return 'marked';
    return 'attempted';
  };

  if (!isSignedIn) return null;

  if (testMode === 'setup') {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Button variant="ghost" onClick={() => router.push('/practice')} className="text-[#8a8a9a]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#ea4335]" />
                    CAT Mock Test
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
                          <SelectItem value="2024">CAT 2024</SelectItem>
                          <SelectItem value="2023">CAT 2023</SelectItem>
                          <SelectItem value="2022">CAT 2022</SelectItem>
                          <SelectItem value="2021">CAT 2021</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[#8a8a9a] text-sm">Section</label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                          <SelectItem value="all">Full Test (All Sections)</SelectItem>
                          <SelectItem value="VARC">Verbal Ability & RC</SelectItem>
                          <SelectItem value="DILR">Data Interpretation & LR</SelectItem>
                          <SelectItem value="QA">Quantitative Aptitude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-[#1a1a24] rounded-sm p-4">
                    <h3 className="text-white font-medium mb-3">Test Pattern</h3>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#ea4335]">66</p>
                        <p className="text-[#8a8a9a] text-xs">Total Questions</p>
                      </div>
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#0066cc]">120</p>
                        <p className="text-[#8a8a9a] text-xs">Minutes</p>
                      </div>
                      <div className="p-3 rounded-sm bg-[#0a0a0f]">
                        <p className="text-2xl font-bold text-[#34a853]">3</p>
                        <p className="text-[#8a8a9a] text-xs">Sections</p>
                      </div>
                    </div>
                    <div className="text-sm text-[#8a8a9a] space-y-1">
                      <p>• VARC: 24 Questions (40 mins)</p>
                      <p>• DILR: 20 Questions (40 mins)</p>
                      <p>• QA: 22 Questions (40 mins)</p>
                      <p>• No negative marking for TITA questions</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { setMode('full'); handleStartTest(); }} className="flex-1 bg-[#ea4335] hover:bg-[#c62828]">
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
                    Retake
                  </Button>
                  <Button onClick={() => router.push('/practice')} className="bg-[#ea4335] hover:bg-[#c62828]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
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
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white">{Math.round((stats.correct / (stats.correct + stats.wrong || 1)) * 100)}%</p>
                    <p className="text-[#8a8a9a] text-sm">Accuracy</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white">Question Review - {currentQ.section}</CardTitle>
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
                            currentQuestion === i ? 'ring-2 ring-[#ea4335]' : '',
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
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-[#ea4335]/20 text-[#ea4335]">{currentQ.section}</Badge>
                      <Badge className={currentQ.difficulty === 'HARD' ? 'bg-[#ea4335]/20 text-[#ea4335]' : currentQ.difficulty === 'MEDIUM' ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-[#34a853]/20 text-[#34a853]'}>
                        {currentQ.difficulty}
                      </Badge>
                    </div>

                    <p className="text-white text-lg mb-6">{currentQ.question}</p>

                    <div className="space-y-3">
                      {currentQ.options.map(opt => (
                        <div
                          key={opt.index}
                          className={cn(
                            'p-4 rounded-sm border',
                            opt.index === currentQ.correctAnswer ? 'border-[#34a853] bg-[#34a853]/10' :
                            opt.index === currentAttempt?.selectedAnswer ? 'border-[#ea4335] bg-[#ea4335]/10' :
                            'border-[#1f1f2e]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'w-8 h-8 rounded-sm flex items-center justify-center font-medium',
                              opt.index === currentQ.correctAnswer ? 'bg-[#34a853] text-white' :
                              opt.index === currentAttempt?.selectedAnswer ? 'bg-[#ea4335] text-white' :
                              'bg-[#1a1a24] text-[#8a8a9a]'
                            )}>
                              {String.fromCharCode(65 + opt.index)}
                            </span>
                            <span className="text-white">{opt.text}</span>
                            {opt.index === currentQ.correctAnswer && <CheckCircle className="w-5 h-5 text-[#34a853]" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#1f1f2e] pt-4 mt-4">
                      <p className="text-[#8a8a9a]">{currentQ.explanation}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="border-[#1f1f2e] text-white">
                      <ChevronLeft className="w-4 h-4 mr-2" />Previous
                    </Button>
                    <Button variant="outline" onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="border-[#1f1f2e] text-white">
                      Next<ChevronRight className="w-4 h-4 ml-2" />
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
  const answeredCount = Object.values(attempts).filter(a => a?.selectedAnswer !== null).length;

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      <header className="h-16 bg-[#0a0a0f] border-b border-[#1f1f2e] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">CAT Mock Test</span>
          <Badge className="bg-[#ea4335]/20 text-[#ea4335]">{currentQ?.section}</Badge>
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
          <Button onClick={handleSubmitTest} className="bg-[#34a853] hover:bg-[#2d8f4a]">Submit</Button>
        </div>
      </header>

      <main className="flex-1 pt-16 flex">
        {showPalette && (
          <div className="w-72 bg-[#0a0a0f] border-r border-[#1f1f2e] p-4 fixed top-16 bottom-0 left-0 overflow-y-auto">
            <div className="mb-4">
              <span className="text-[#8a8a9a] text-sm">Progress: {answeredCount}/{questions.length}</span>
              <Progress value={(answeredCount / questions.length) * 100} className="h-2 mt-2" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const status = getQuestionStatus(i);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(i)}
                    className={cn(
                      'h-10 rounded-sm font-medium text-sm',
                      currentQuestion === i ? 'ring-2 ring-[#ea4335]' : '',
                      status === 'attempted' ? 'bg-[#34a853] text-white' :
                      status === 'marked' ? 'bg-[#fbbc04] text-black' :
                      'bg-[#1a1a24] text-[#8a8a9a]'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-[#8a8a9a] space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#34a853] rounded-sm"></div><span>Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#fbbc04] rounded-sm"></div><span>Marked</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1a1a24] rounded-sm"></div><span>Not Answered</span></div>
            </div>
          </div>
        )}

        <div className={cn('flex-1 p-6', showPalette ? 'pl-80' : '')}>
          {currentQ && (
            <motion.div key={currentQ.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#0066cc]/20 text-[#0066cc]">Q{currentQuestion + 1}</Badge>
                      <Badge className="bg-[#ea4335]/20 text-[#ea4335]">{currentQ.section}</Badge>
                      <Badge className={currentQ.difficulty === 'HARD' ? 'bg-[#ea4335]/20 text-[#ea4335]' : currentQ.difficulty === 'MEDIUM' ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-[#34a853]/20 text-[#34a853]'}>{currentQ.difficulty}</Badge>
                    </div>
                    <Button variant="ghost" onClick={toggleMarkForReview} className="text-[#8a8a9a]">
                      <Bookmark className={cn('w-4 h-4', attempts[currentQ.id]?.isMarkedForReview ? 'fill-[#fbbc04] text-[#fbbc04]' : '')} />
                    </Button>
                  </div>

                  <p className="text-white text-lg mb-6">{currentQ.question}</p>

                  <div className="space-y-3">
                    {currentQ.options.map(opt => (
                      <button
                        key={opt.index}
                        onClick={() => handleAnswerSelect(opt.index)}
                        className={cn(
                          'w-full p-4 rounded-sm border text-left',
                          attempts[currentQ.id]?.selectedAnswer === opt.index ? 'border-[#0066cc] bg-[#0066cc]/10' : 'border-[#1f1f2e]'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            'w-8 h-8 rounded-sm flex items-center justify-center font-medium',
                            attempts[currentQ.id]?.selectedAnswer === opt.index ? 'bg-[#0066cc] text-white' : 'bg-[#1a1a24] text-[#8a8a9a]'
                          )}>
                            {String.fromCharCode(65 + opt.index)}
                          </span>
                          <span className="text-white">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t border-[#1f1f2e]">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="border-[#1f1f2e] text-white">
                      <ChevronLeft className="w-4 h-4 mr-2" />Previous
                    </Button>
                    <Button variant="outline" onClick={() => setShowPalette(!showPalette)} className="border-[#1f1f2e] text-white">
                      {showPalette ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {currentQuestion < questions.length - 1 ? (
                      <Button onClick={handleNext} className="bg-[#ea4335] hover:bg-[#c62828]">
                        Save & Next<ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitTest} className="bg-[#34a853] hover:bg-[#2d8f4a]">Submit</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}