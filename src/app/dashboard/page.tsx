'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  Target,
  Flame,
  Calendar,
  Clock,
  ArrowRight,
  Zap,
  BarChart3,
  ChevronRight,
  Brain,
  Trophy,
  Plus,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface DashboardData {
  user: {
    name: string;
    studyHours: number;
    streakDays: number;
    examType: string;
    branchId: string | null;
  };
  progress: {
    totalTopics: number;
    completedTopics: number;
    completionPercentage: number;
  };
  performance: {
    totalAttempts: number;
    accuracy: number;
  };
  weeklyStudyHours: number;
  backlogCount: number;
  upcomingExams: { id: string; title: string; targetDate: Date; daysLeft: number }[];
  isNewUser: boolean;
}

const EXAM_TYPES = [
  { id: 'GATE', name: 'GATE - Computer Science' },
  { id: 'CAT', name: 'CAT' },
];

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [selectedExam, setSelectedExam] = useState('UNIVERSITY');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (json.isNewUser) {
            setShowSetup(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn]);

  const handleSetup = async () => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: selectedExam }),
      });
      setShowSetup(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!isSignedIn || !user) {
    return null;
  }

  const readinessScore = data?.progress.completionPercentage || 0;

  if (showSetup || data?.isNewUser) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Sidebar collapsed={false} onToggle={() => {}} />
        <main className="pl-[280px] pt-16">
          <div className="p-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.firstName}!</h1>
              <p className="text-[#8a8a9a]">Let's set up your learning preferences</p>
            </motion.div>

            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-white mb-2 block">What exam are you preparing for?</Label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                      {EXAM_TYPES.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="text-white">
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-[#1a1a24] rounded-sm p-4">
                  <h3 className="text-white font-medium mb-2">What's next?</h3>
                  <ul className="text-[#8a8a9a] text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#0066cc]" />
                      Go to Admin page to add your syllabus
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#0066cc]" />
                      Use Workspace to select topics and start studying
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-[#0066cc]" />
                      Take quizzes to test your knowledge
                    </li>
                  </ul>
                </div>

                <Button onClick={handleSetup} className="w-full bg-[#0066cc] hover:bg-[#0052a3]">
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="p-6 space-y-6"
        >
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user.firstName || 'Student'} 👋
              </h1>
              <p className="text-[#8a8a9a] mt-1">
                {data?.user.examType ? `${data.user.examType} preparation` : 'Start your learning journey'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="text-[#8a8a9a]">
                <Settings className="w-4 h-4 mr-1" />
                Setup
              </Button>
              <Badge className="bg-[#0066cc]/20 text-[#0066cc] border-[#0066cc]/30">
                <Flame className="w-3 h-3 mr-1" />
                {data?.user.streakDays || 0} day streak
              </Badge>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.progress.totalTopics === 0 ? (
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#0066cc]/20 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-[#0066cc]" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Get Started</h3>
                <p className="text-[#8a8a9a] mb-6">Add your first syllabus to start learning</p>
                <Button onClick={() => router.push('/admin')} className="bg-[#0066cc] hover:bg-[#0052a3]">
                  Go to Admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8a8a9a] text-sm">Readiness Score</p>
                      <p className="text-3xl font-bold text-white mt-1">{readinessScore}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-sm bg-[#0066cc]/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#0066cc]" />
                    </div>
                  </div>
                  <Progress value={readinessScore} className="mt-3 h-1.5" />
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8a8a9a] text-sm">Topics Completed</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {data?.progress.completedTopics || 0}/{data?.progress.totalTopics || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-sm bg-[#34a853]/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-[#34a853]" />
                    </div>
                  </div>
                  <Progress value={data?.progress.completionPercentage || 0} className="mt-3 h-1.5 bg-[#1a1a24]" />
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8a8a9a] text-sm">Backlog</p>
                      <p className="text-3xl font-bold text-white mt-1">{data?.backlogCount || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-sm bg-[#fbbc04]/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#fbbc04]" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[#8a8a9a]">Topics to review</div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#8a8a9a] text-sm">Total Study Hours</p>
                      <p className="text-3xl font-bold text-white mt-1">{data?.user.studyHours || 0}h</p>
                    </div>
                    <div className="w-12 h-12 rounded-sm bg-[#9333ea]/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#9333ea]" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[#8a8a9a]">This week: {data?.weeklyStudyHours || 0}h</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-lg">Continue Learning</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/workspace')} className="text-[#0066cc]">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/workspace')} className="w-full bg-[#1a1a24] hover:bg-[#252530] border border-[#1f1f2e] justify-start p-6 h-auto">
                    <BookOpen className="w-8 h-8 text-[#0066cc] mr-4" />
                    <div className="text-left">
                      <p className="text-white font-medium">Start Learning</p>
                      <p className="text-[#8a8a9a] text-sm">Select topics from your syllabus</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-[#0a0a0f] border-[#1f1f2e] h-full">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#0066cc]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => router.push('/workspace')} className="w-full bg-[#0066cc] hover:bg-[#0052a3] justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/practice')} className="w-full border-[#1f1f2e] text-white hover:bg-[#1a1a24] justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Take a Quiz
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/planner')} className="w-full border-[#1f1f2e] text-white hover:bg-[#1a1a24] justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Planner
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#8a8a9a]" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-sm bg-[#1a1a24] text-center">
                      <Trophy className="w-8 h-8 text-[#fbbc04] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{data?.performance.accuracy || 0}%</p>
                      <p className="text-[#8a8a9a] text-xs">Accuracy</p>
                    </div>
                    <div className="p-4 rounded-sm bg-[#1a1a24] text-center">
                      <Target className="w-8 h-8 text-[#0066cc] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{data?.performance.totalAttempts || 0}</p>
                      <p className="text-[#8a8a9a] text-xs">Questions Attempted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#8a8a9a]" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" onClick={() => router.push('/admin')} className="w-full border-[#1f1f2e] text-white hover:bg-[#1a1a24] justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Syllabus
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/notebook')} className="w-full border-[#1f1f2e] text-white hover:bg-[#1a1a24] justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    My Notes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}