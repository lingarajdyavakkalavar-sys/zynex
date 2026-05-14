'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

interface MCQ {
  id: string;
  question: string;
  difficulty: string;
  section: string | null;
  marks: number;
  negativeMarks: number;
  options: { index: number; text: string }[];
  topic: { id: string; title: string };
}

interface QuizState {
  mode: string;
  topicIds: string[];
  duration: number;
}

export default function PracticePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<'selection' | 'quiz' | 'results'>('selection');
  const [quizConfig, setQuizConfig] = useState<QuizState>({
    mode: 'PRACTICE',
    topicIds: [],
    duration: 1800,
  });
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (mode === 'quiz' && timeLeft > 0) {
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
  }, [mode, timeLeft]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mcq?limit=10&topicIds=${quizConfig.topicIds.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setMcqs(data);
        
        const sessionRes = await fetch('/api/mcq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start-session',
            data: {
              mode: quizConfig.mode,
              topicIds: quizConfig.topicIds,
              totalQuestions: data.length,
              duration: quizConfig.duration,
            },
          }),
        });
        const session = await sessionRes.json();
        setSessionId(session.id);
        
        setMode('quiz');
        setTimeLeft(quizConfig.duration);
        setCurrentQuestion(0);
        setAnswers({});
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswers({ ...answers, [currentQuestion]: index });
  };

  const handleNext = async () => {
    if (selectedAnswer !== null && sessionId) {
      const mcq = mcqs[currentQuestion];
      const isCorrect = selectedAnswer === mcq.options.findIndex(o => o.index === 0) + 1;
      
      await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-answer',
          data: {
            mcqId: mcq.id,
            selectedIndex: selectedAnswer,
            isCorrect,
            timeSpent: 30,
            quizSessionId: sessionId,
          },
        }),
      });
    }

    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] ?? null);
      setShowExplanation(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const correctCount = Object.entries(answers).filter(([idx, ans]) => {
      const mcq = mcqs[parseInt(idx)];
      return ans === mcq.options.findIndex(o => o.index === 0) + 1;
    }).length;

    if (sessionId) {
      await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-session',
          data: { sessionId, correctCount },
        }),
      });
    }

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
      if (answer === undefined) {
        skipped++;
      } else if (answer === mcq.options.findIndex(o => o.index === 0) + 1) {
        correct++;
      } else {
        wrong++;
      }
    });

    return { correct, wrong, skipped, total: mcqs.length };
  };

  if (!isSignedIn) return null;

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Practice Tests</h1>
            <p className="text-[#8a8a9a] mb-8">Choose your quiz configuration</p>

            <div className="grid md:grid-cols-3 gap-6">
              {['PRACTICE', 'TIMED_TEST', 'REVISION'].map((quizMode) => (
                <Card
                  key={quizMode}
                  className={cn(
                    'bg-[#0a0a0f] border-[#1f1f2e] cursor-pointer transition-all hover:border-[#0066cc]/50',
                    quizConfig.mode === quizMode && 'border-[#0066cc]'
                  )}
                  onClick={() => setQuizConfig({ ...quizConfig, mode: quizMode })}
                >
                  <CardContent className="p-6 text-center">
                    <Target className={cn('w-10 h-10 mx-auto mb-4', quizConfig.mode === quizMode ? 'text-[#0066cc]' : 'text-[#8a8a9a]')} />
                    <h3 className="text-white font-semibold mb-2">{quizMode.replace('_', ' ')}</h3>
                    <p className="text-[#8a8a9a] text-sm">
                      {quizMode === 'PRACTICE' && 'No time limit, instant feedback'}
                      {quizMode === 'TIMED_TEST' && '30 min countdown, simulate exam'}
                      {quizMode === 'REVISION' && 'Focus on weak topics'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 premium-card p-6">
              <h3 className="text-white font-semibold mb-4">Timer Duration</h3>
              <div className="flex gap-4">
                {[600, 1200, 1800, 3600].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setQuizConfig({ ...quizConfig, duration })}
                    className={cn(
                      'px-4 py-2 rounded-sm border transition-colors',
                      quizConfig.duration === duration
                        ? 'border-[#0066cc] bg-[#0066cc]/20 text-[#0066cc]'
                        : 'border-[#1f1f2e] text-[#8a8a9a] hover:border-[#0066cc]/50'
                    )}
                  >
                    {formatTime(duration)}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={startQuiz}
              disabled={loading}
              className="w-full mt-8 bg-[#0066cc] hover:bg-[#0052a3] h-12"
            >
              {loading ? 'Loading...' : 'Start Quiz'}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (mode === 'results') {
    const results = calculateResults();
    const percentage = Math.round((results.correct / results.total) * 100);

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

              <div className="premium-card p-8 mb-6">
                <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
                <p className="text-[#8a8a9a]">
                  {results.correct} out of {results.total} correct
                </p>
                <Progress value={percentage} className="mt-6 h-2" />
              </div>

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
                <Button onClick={() => setMode('selection')} className="bg-[#0066cc] hover:bg-[#0052a3]">
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
  const progress = ((currentQuestion + 1) / mcqs.length) * 100;
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
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-sm',
              timeLeft < 300 ? 'bg-[#dc2626]/20 text-[#dc2626]' : 'bg-[#1a1a24] text-white'
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
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
                  {mcq?.section && (
                    <Badge variant="outline" className="border-[#1f1f2e] text-[#8a8a9a] text-xs">
                      {mcq.section}
                    </Badge>
                  )}
                  <Badge className="bg-[#1a1a24] text-white">{mcq?.marks} marks</Badge>
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
                        'flex items-center gap-3 p-4 rounded-sm border border-[#1f1f2e] cursor-pointer transition-all',
                        selectedAnswer === option.index && 'border-[#0066cc] bg-[#0066cc]/10',
                        showExplanation && option.index === correctIndex && 'border-[#34a853] bg-[#34a853]/10'
                      )}
                    >
                      <RadioGroupItem value={option.index.toString()} id={`option-${i}`} className="border-[#1f1f2e]" />
                      <span className="text-white">{option.text}</span>
                      {showExplanation && option.index === correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-[#34a853] ml-auto" />
                      )}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

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
                  disabled={selectedAnswer === null}
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