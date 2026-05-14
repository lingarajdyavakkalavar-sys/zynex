'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  Flame,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { EXAMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const timelineData = [
  { month: 'Jul', target: 100, completed: 80 },
  { month: 'Aug', target: 200, completed: 180 },
  { month: 'Sep', target: 320, completed: 250 },
  { month: 'Oct', target: 450, completed: 320 },
  { month: 'Nov', target: 600, completed: 380 },
  { month: 'Dec', target: 750, completed: 420 },
];

export default function PlannerPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [examDate, setExamDate] = useState('2026-02-01');
  const [dailyHours, setDailyHours] = useState(4);
  const [subjectsRemaining, setSubjectsRemaining] = useState(6);
  const [backlogTopics, setBacklogTopics] = useState(5);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [isSignedIn, router]);

  const daysUntilExam = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const totalStudyHours = daysUntilExam * dailyHours;
  const dailyTarget = Math.ceil((subjectsRemaining * 20 + backlogTopics * 5) / daysUntilExam);
  const monthlyQuota = dailyTarget * 30;
  const readinessScore = Math.min(100, Math.round((totalStudyHours / 800) * 100));

  const isBurnout = dailyHours > 6;
  const isUnrealistic = dailyTarget > 8;

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Study Planner</h1>
            <p className="text-[#8a8a9a]">Plan your preparation and track readiness</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#8a8a9a] text-sm">Target Exam</Label>
                    <Select defaultValue="GATE">
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        {EXAMS.map(exam => (
                          <SelectItem key={exam.id} value={exam.id} className="text-white">
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#8a8a9a] text-sm">Exam Date</Label>
                    <Input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="bg-[#1a1a24] border-[#1f1f2e] text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[#8a8a9a] text-sm">Daily Hours: {dailyHours}h</Label>
                    <Slider
                      value={[dailyHours]}
                      onValueChange={(v) => setDailyHours(v[0])}
                      min={1}
                      max={12}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-[#8a8a9a] text-sm">Subjects Remaining</Label>
                    <Select value={subjectsRemaining.toString()} onValueChange={(v) => setSubjectsRemaining(parseInt(v))}>
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        {[2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-white">{n} subjects</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {(isBurnout || isUnrealistic) && (
                <Card className="bg-[#dc2626]/10 border-[#dc2626]/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
                      <span className="text-[#dc2626] font-medium">Warning</span>
                    </div>
                    {isBurnout && (
                      <p className="text-[#8a8a9a] text-sm">
                        Studying more than 6 hours daily may lead to burnout.
                      </p>
                    )}
                    {isUnrealistic && (
                      <p className="text-[#8a8a9a] text-sm">
                        Daily target exceeds 8 hours. This may be unrealistic.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#0066cc]/20 flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-[#0066cc]" />
                    </div>
                    <p className="text-[#8a8a9a] text-xs">Days Left</p>
                    <p className="text-2xl font-bold text-white">{daysUntilExam}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#34a853]/20 flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-[#34a853]" />
                    </div>
                    <p className="text-[#8a8a9a] text-xs">Total Hours</p>
                    <p className="text-2xl font-bold text-white">{totalStudyHours}h</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#fbbc04]/20 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-[#fbbc04]" />
                    </div>
                    <p className="text-[#8a8a9a] text-xs">Daily Target</p>
                    <p className="text-2xl font-bold text-white">{dailyTarget}h</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#9333ea]/20 flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-5 h-5 text-[#9333ea]" />
                    </div>
                    <p className="text-[#8a8a9a] text-xs">Monthly Quota</p>
                    <p className="text-2xl font-bold text-white">{monthlyQuota}h</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#0066cc]" />
                    Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#1f1f2e" strokeWidth="8" />
                        <circle
                          cx="64" cy="64" r="56" fill="none"
                          stroke={readinessScore > 70 ? '#34a853' : readinessScore > 40 ? '#fbbc04' : '#dc2626'}
                          strokeWidth="8"
                          strokeDasharray={`${(readinessScore / 100) * 352} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{readinessScore}%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8a8a9a]">Topics Covered</span>
                        <span className="text-white">8/15</span>
                      </div>
                      <Progress value={53} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#8a8a9a]">Practice Questions</span>
                        <span className="text-white">245/500</span>
                      </div>
                      <Progress value={49} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#fbbc04]" />
                    Weak Subject Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { subject: 'Operating Systems', score: 45, status: 'critical' },
                      { subject: 'Database Systems', score: 58, status: 'warning' },
                      { subject: 'Computer Networks', score: 62, status: 'ok' },
                    ].map((item) => (
                      <div key={item.subject} className="flex items-center justify-between p-3 rounded-sm bg-[#1a1a24]">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            item.status === 'critical' && 'bg-[#dc2626]',
                            item.status === 'warning' && 'bg-[#fbbc04]',
                            item.status === 'ok' && 'bg-[#34a853]'
                          )} />
                          <span className="text-white">{item.subject}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={item.score} className="w-24 h-2" />
                          <span className="text-[#8a8a9a] text-sm">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}