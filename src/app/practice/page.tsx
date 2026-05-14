'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Clock, Award, ChevronRight, FileText, Calculator,
  Brain, History, Zap, Play, Settings, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RecentSession {
  id: string;
  mode: string;
  examType: string;
  year: number | null;
  branchCode: string | null;
  sectionCode: string | null;
  totalQuestions: number;
  correctCount: number;
  obtainedMarks: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
}

const GATE_BRANCHES = [
  { code: 'CS', name: 'Computer Science' },
  { code: 'EC', name: 'Electronics & Comm' },
  { code: 'EE', name: 'Electrical' },
  { code: 'ME', name: 'Mechanical' },
  { code: 'CE', name: 'Civil' },
];

const CAT_SECTIONS = [
  { code: 'VARC', name: 'Verbal Ability & RC' },
  { code: 'DILR', name: 'Data Interpretation & LR' },
  { code: 'QA', name: 'Quantitative Aptitude' },
];

export default function PracticePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [selectedExam, setSelectedExam] = useState<'GATE' | 'CAT'>('GATE');
  const [selectedBranch, setSelectedBranch] = useState('CS');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/quiz/start');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isSignedIn) {
      fetchSessions();
    }
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Practice Center</h1>
              <p className="text-[#8a8a9a] mt-1">Prepare for GATE and CAT with official question papers</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/analytics')} className="border-[#1f1f2e] text-white">
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </motion.div>

          <div className="flex gap-4">
            <Button
              onClick={() => setSelectedExam('GATE')}
              className={cn(
                'px-6 py-3 text-lg font-semibold transition-all',
                selectedExam === 'GATE'
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-[#0a0a0f] border border-[#1f1f2e] text-[#8a8a9a] hover:text-white'
              )}
            >
              GATE
            </Button>
            <Button
              onClick={() => setSelectedExam('CAT')}
              className={cn(
                'px-6 py-3 text-lg font-semibold transition-all',
                selectedExam === 'CAT'
                  ? 'bg-[#ea4335] text-white'
                  : 'bg-[#0a0a0f] border border-[#1f1f2e] text-[#8a8a9a] hover:text-white'
              )}
            >
              CAT
            </Button>
          </div>

          {selectedExam === 'GATE' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#0066cc]" />
                    GATE Mock Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        {GATE_BRANCHES.map(b => (
                          <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => router.push('/practice/gate-test')}
                    className="w-full bg-[#0066cc] hover:bg-[#0052a3] py-6 text-lg"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Start Full Mock Test
                    <ChevronRight className="w-5 h-5 ml-auto" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => router.push('/practice/gate-test?mode=sectional')}
                      variant="outline"
                      className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] py-4"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-[#0066cc]" />
                      Sectional Test
                    </Button>
                    <Button
                      onClick={() => router.push('/practice/gate-test?mode=practice')}
                      variant="outline"
                      className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] py-4"
                    >
                      <Zap className="w-4 h-4 mr-2 text-[#fbbc04]" />
                      Practice Mode
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#34a853]" />
                    Previous Year Papers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[2024, 2023, 2022, 2021, 2020, 2019].map(year => (
                      <button
                        key={year}
                        onClick={() => router.push(`/practice/gate-test?year=${year}`)}
                        className="w-full flex items-center justify-between p-4 rounded-sm bg-[#1a1a24] hover:bg-[#252530] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-[#0066cc]/20 flex items-center justify-center">
                            <span className="text-[#0066cc] font-bold">{year.toString().slice(-2)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">GATE {year}</p>
                            <p className="text-[#8a8a9a] text-xs">65 Questions | 180 mins</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8a8a9a]" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#9333ea]" />
                    Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] py-6">
                      <Calculator className="w-6 h-6 mr-2 text-[#9333ea]" />
                      GATE Calculator
                    </Button>
                    <Button variant="outline" className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] py-6">
                      <BookOpen className="w-6 h-6 mr-2 text-[#34a853]" />
                      Formula Sheet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#fbbc04]" />
                    Quick Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Engineering Mathematics', 'Digital Logic', 'Algorithms', 'Operating Systems'].map((topic, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 p-3 rounded-sm bg-[#1a1a24] hover:bg-[#252530] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-sm bg-[#fbbc04]/20 flex items-center justify-center">
                          <span className="text-[#fbbc04] font-bold text-sm">{i + 1}</span>
                        </div>
                        <span className="text-white text-sm">{topic}</span>
                        <Badge className="ml-auto bg-[#0066cc]/20 text-[#0066cc]">10 Qs</Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#ea4335]" />
                    CAT Mock Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => router.push('/practice/cat-test?section=all')}
                    className="w-full bg-[#ea4335] hover:bg-[#c62828] py-6 text-lg"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Start Full Mock Test
                    <ChevronRight className="w-5 h-5 ml-auto" />
                  </Button>

                  <div className="grid grid-cols-3 gap-3">
                    {CAT_SECTIONS.map(section => (
                      <Button
                        key={section.code}
                        onClick={() => router.push(`/practice/cat-test?section=${section.code}`)}
                        variant="outline"
                        className="border-[#1f1f2e] text-white hover:bg-[#1a1a24] py-4"
                      >
                        <Target className="w-4 h-4 mr-2 text-[#ea4335]" />
                        {section.code}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#34a853]" />
                    Previous Year Papers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[2024, 2023, 2022, 2021].map(year => (
                      <button
                        key={year}
                        onClick={() => router.push(`/practice/cat-test?year=${year}`)}
                        className="w-full flex items-center justify-between p-4 rounded-sm bg-[#1a1a24] hover:bg-[#252530] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-[#ea4335]/20 flex items-center justify-center">
                            <span className="text-[#ea4335] font-bold">{year.toString().slice(-2)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">CAT {year}</p>
                            <p className="text-[#8a8a9a] text-xs">66 Questions | 120 mins</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8a8a9a]" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#fbbc04]" />
                    CAT Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {['VARC', 'DILR', 'QA'].map(section => (
                      <Button
                        key={section}
                        variant="outline"
                        className="border-[#1f1f2e] text-white hover:bg-[#1a1a24]"
                      >
                        {section}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#8a8a9a]" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-sm bg-[#1a1a24]"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={session.examType === 'GATE' ? 'bg-[#0066cc]/20 text-[#0066cc]' : 'bg-[#ea4335]/20 text-[#ea4335]'}>
                          {session.examType}
                        </Badge>
                        <div>
                          <p className="text-white font-medium">
                            {session.mode} {session.year ? `(${session.year})` : ''}
                          </p>
                          <p className="text-[#8a8a9a] text-xs">
                            {new Date(session.startedAt).toLocaleDateString()} - {session.totalQuestions} questions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{session.obtainedMarks || 0}</p>
                        <p className="text-[#8a8a9a] text-xs">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}