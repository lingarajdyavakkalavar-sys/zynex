'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Target,
  BarChart3,
  RotateCcw,
  BookOpen,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface MCQ {
  id: string;
  question: string;
  difficulty: string;
  section: string | null;
  marks: number;
  options: { index: number; text: string }[];
  topic: { id: string; title: string };
  explanation?: string;
}

interface SyllabusOption {
  id: string;
  title: string;
  subjectName: string;
}

export default function PracticePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<SyllabusOption[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
  const [mode, setMode] = useState<'selection' | 'quiz' | 'results'>('selection');
  const [quizMode, setQuizMode] = useState<string>('PRACTICE');
  const [questionCount, setQuestionCount] = useState<string>('5');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [syllabiLoading, setSyllabiLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchSyllabi() {
      try {
        const res = await fetch('/api/syllabus?isPublished=true');
        if (res.ok) {
          const data = await res.json();
          const options = data.map((s: any) => ({
            id: s.id,
            title: s.title,
            subjectName: s.subject?.name || 'Unknown',
          }));
          setSyllabi(options);
          if (options.length > 0) {
            setSelectedSyllabusId(options[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch syllabi:', error);
      } finally {
        setSyllabiLoading(false);
      }
    }
    if (isSignedIn) {
      fetchSyllabi();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (mode === 'quiz' && timeLeft > 0 && quizMode === 'TIMED_TEST') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, timeLeft, quizMode]);

  const startQuiz = async () => {
    if (!syllabi.length) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/mcq?subjectId=${selectedSyllabusId}&limit=${questionCount}`);
      if (res.ok) {
        const data = await res.json();
        setMcqs(data);
        
        if (data.length === 0) {
          alert('No questions found. Please add MCQs in the admin panel.');
          setLoading(false);
          return;
        }
        
        setMode('quiz');
        setTimeLeft(quizMode === 'TIMED_TEST' ? 1800 : 0);
        setCurrentQuestion(0);
        setAnswers({});
        setShowExplanation(false);
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (quizMode === 'PRACTICE') {
      setSelectedAnswer(index);
      setAnswers({ ...answers, [currentQuestion]: index });
      setShowExplanation(true);
    } else {
      setSelectedAnswer(index);
      setAnswers({ ...answers, [currentQuestion]: index });
    }
  };

  const handleNext = async () => {
    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] ?? null);
      setShowExplanation(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setMode('results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    mcqs.forEach((mcq, i) => {
      const answer = answers[i];
      const correctIdx = mcq.options.findIndex(o => o.index === 0) + 1;
      if (answer === undefined) {
        skipped++;
      } else if (answer === correctIdx) {
        correct++;
      } else {
        wrong++;
      }
    });

    return { correct, wrong, skipped, total: mcqs.length };
  };

  const resetQuiz = () => {
    setMode('selection');
    setMcqs([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowExplanation(false);
  };

  if (!isSignedIn) return null;

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Practice Tests</h1>
            <p className="text-[#8a8a9a] mb-8">Configure and start your quiz</p>

            {syllabiLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : syllabi.length === 0 ? (
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0066cc]/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-[#0066cc]" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">No Syllabus Found</h3>
                  <p className="text-[#8a8a9a] mb-6">Add a syllabus and MCQs first to start practicing</p>
                  <Button onClick={() => router.push('/admin')} className="bg-[#0066cc] hover:bg-[#0052a3]">
                    <Plus className="w-4 h-4 mr-2" />
                    Go to Admin
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {['PRACTICE', 'TIMED_TEST', 'REVISION'].map((m) => (
                    <Card
                      key={m}
                      className={cn(
                        'bg-[#0a0a0f] border-[#1f1f2e] cursor-pointer transition-all hover:border-[#0066cc]/50',
                        quizMode === m && 'border-[#0066cc]'
                      )}
                      onClick={() => setQuizMode(m)}
                    >
                      <CardContent className="p-6 text-center">
                        <Target className={cn('w-10 h-10 mx-auto mb-4', quizMode === m ? 'text-[#0066cc]' : 'text-[#8a8a9a]')} />
                        <h3 className="text-white font-semibold mb-2">{m.replace('_', ' ')}</h3>
                        <p className="text-[#8a8a9a] text-sm">
                          {m === 'PRACTICE' && 'Instant feedback, no timer'}
                          {m === 'TIMED_TEST' && '30 min countdown'}
                          {m === 'REVISION' && 'Focus on weak areas'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-[#0a0a0f] border-[#1f1f2e] mb-6">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Select Subject</Label>
                      <Select value={selectedSyllabusId} onValueChange={setSelectedSyllabusId}>
                        <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                          {syllabi.map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-white">
                              {s.subjectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Number of Questions</Label>
                      <div className="flex gap-3">
                        {['5', '10', '15', '20'].map((count) => (
                          <button
                            key={count}
                            onClick={() => setQuestionCount(count)}
                            className={cn(
                              'px-4 py-2 rounded-sm border transition-colors',
                              questionCount === count
                                ? 'border-[#0066cc] bg-[#0066cc]/20 text-[#0066cc]'
                                : 'border-[#1f1f2e] text-[#8a8a9a] hover:border-[#0066cc]/50'
                            )}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={startQuiz}
                  disabled={loading || syllabi.length === 0}
                  className="w-full bg-[#0066cc] hover:bg-[#0052a3] h-12"
                >
                  {loading ? 'Loading...' : `Start ${questionCount} Question Quiz`}
                </Button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (mode === 'results') {
    const results = calculateResults();
    const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
              <p className="text-[#8a8a9a] mb-8">Here are your results</p>

              <Card className="premium-card p-8 mb-6 bg-[#0a0a0f] border-[#1f1f2e]">
                <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
                <p className="text-[#8a8a9a]">
                  {results.correct} out of {results.total} correct
                </p>
                <Progress value={percentage} className="mt-6 h-2" />
              </Card>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-sm bg-[#34a853]/20">
                  <div className="text-2xl font-bold text-[#34a853]">{results.correct}</div>
                  <div className="text-[#8a8a9a] text-sm">Correct</div>
                </div>
                <div className="p-4 rounded-sm bg-[#dc2626]/20">
                  <div className="text-2xl font-bold text-[#dc2626]">{results.wrong}</div>
                  <div className="text-[#8a8a9a] text-sm">Wrong</div>
                </div>
                <div className="p-4 rounded-sm bg-[#1a1a24]">
                  <div className="text-2xl font-bold text-white">{results.skipped}</div>
                  <div className="text-[#8a8a9a] text-sm">Skipped</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={resetQuiz} className="bg-[#0066cc] hover:bg-[#0052a3]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-[#1f1f2e]">
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  const mcq = mcqs[currentQuestion];
  const progress = mcqs.length > 0 ? ((currentQuestion + 1) / mcqs.length) * 100 : 0;
  const correctIndex = mcq?.options.findIndex(o => o.index === 0) + 1;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">MCQ Practice</h1>
              <p className="text-[#8a8a9a]">Question {currentQuestion + 1} of {mcqs.length}</p>
            </div>
            {quizMode === 'TIMED_TEST' && (
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-sm',
                timeLeft < 300 ? 'bg-[#dc2626]/20 text-[#dc2626]' : 'bg-[#1a1a24] text-white'
              )}>
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-1.5" />
          </div>

          <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    'text-xs',
                    mcq?.difficulty === 'EASY' && 'bg-[#34a853]/20 text-[#34a853]',
                    mcq?.difficulty === 'MEDIUM' && 'bg-[#fbbc04]/20 text-[#fbbc04]',
                    mcq?.difficulty === 'HARD' && 'bg-[#dc2626]/20 text-[#dc2626]'
                  )}>
                    {mcq?.difficulty}
                  </Badge>
                  <Badge className="bg-[#1a1a24] text-white">{mcq?.topic?.title}</Badge>
                </div>
              </div>

              <h2 className="text-xl text-white font-medium mb-6">{mcq?.question}</h2>

              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(v) => handleAnswer(parseInt(v))}
                className="space-y-3"
              >
                {mcq?.options.map((option, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Label
                      htmlFor={`option-${i}`}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-sm border cursor-pointer transition-all',
                        selectedAnswer === option.index && !showExplanation && 'border-[#0066cc] bg-[#0066cc]/10',
                        showExplanation && option.index === correctIndex && 'border-[#34a853] bg-[#34a853]/10',
                        showExplanation && selectedAnswer === option.index && option.index !== correctIndex && 'border-[#dc2626] bg-[#dc2626]/10',
                        !showExplanation && 'border-[#1f1f2e] hover:border-[#0066cc]/50'
                      )}
                    >
                      <RadioGroupItem value={option.index.toString()} id={`option-${i}`} className="border-[#1f1f2e]" />
                      <span className="text-white">{option.text}</span>
                      {showExplanation && option.index === correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-[#34a853] ml-auto" />
                      )}
                      {showExplanation && selectedAnswer === option.index && option.index !== correctIndex && (
                        <XCircle className="w-5 h-5 text-[#dc2626] ml-auto" />
                      )}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              {showExplanation && mcq?.explanation && (
                <div className="mt-4 p-4 rounded-sm bg-[#1a1a24] border border-[#1f1f2e]">
                  <p className="text-[#8a8a9a] text-sm"><strong className="text-white">Explanation:</strong> {mcq.explanation}</p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  className="text-[#8a8a9a]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null && !showExplanation}
                  className="bg-[#0066cc] hover:bg-[#0052a3]"
                >
                  {currentQuestion === mcqs.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-5 gap-2">
            {mcqs.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentQuestion(i);
                  setSelectedAnswer(answers[i] ?? null);
                  setShowExplanation(false);
                }}
                className={cn(
                  'w-full aspect-square rounded-sm text-sm font-medium transition-all',
                  currentQuestion === i && 'bg-[#0066cc] text-white',
                  currentQuestion !== i && answers[i] !== undefined && 'bg-[#34a853]/20 text-[#34a853]',
                  currentQuestion !== i && answers[i] === undefined && 'bg-[#1a1a24] text-[#8a8a9a]'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}