'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  readinessScore: number;
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalMcqs: number;
  availableMcqs: number;
  studyHours: number;
  streakDays: number;
  weakTopics: { topicId: string; topicName: string; wrongCount: number }[];
  recentSessions: {
    id: string;
    mode: string;
    totalQuestions: number;
    correctCount: number;
    startedAt: string;
    completedAt: string | null;
    attemptCount: number;
    accuracy: number;
  }[];
  dailyStudyStats: { day: string; hours: number }[];
  weeklyTotal: number;
}

const COLORS = ['#0066cc', '#34a853', '#fbbc04', '#ea4335', '#9333ea'];

export default function AnalyticsPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isSignedIn) {
      fetchAnalytics();
    }
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  const accuracyData = data ? [
    { name: 'Correct', value: data.correctAttempts, color: '#34a853' },
    { name: 'Incorrect', value: data.totalAttempts - data.correctAttempts, color: '#ea4335' },
  ] : [];

  const modeDistribution = data?.recentSessions.reduce((acc, session) => {
    const mode = session.mode || 'Unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const modeChartData = Object.entries(modeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

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
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-[#8a8a9a] mt-1">Track your performance and progress</p>
            </div>
            <Button onClick={() => router.push('/practice')} className="bg-[#0066cc] hover:bg-[#0052a3]">
              <Target className="w-4 h-4 mr-2" />
              Take a Quiz
            </Button>
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
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#8a8a9a] text-sm">Readiness Score</p>
                        <p className="text-3xl font-bold text-white mt-1">{data?.readinessScore || 0}%</p>
                      </div>
                      <div className="w-12 h-12 rounded-sm bg-[#0066cc]/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[#0066cc]" />
                      </div>
                    </div>
                    <Progress value={data?.readinessScore || 0} className="mt-3 h-1.5" />
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#8a8a9a] text-sm">Questions Attempted</p>
                        <p className="text-3xl font-bold text-white mt-1">{data?.totalAttempts || 0}</p>
                      </div>
                      <div className="w-12 h-12 rounded-sm bg-[#34a853]/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-[#34a853]" />
                      </div>
                    </div>
                    <p className="text-xs text-[#8a8a9a] mt-3">{data?.availableMcqs || 0} more available</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#8a8a9a] text-sm">Accuracy</p>
                        <p className="text-3xl font-bold text-white mt-1">{data?.accuracy || 0}%</p>
                      </div>
                      <div className="w-12 h-12 rounded-sm bg-[#fbbc04]/20 flex items-center justify-center">
                        <Award className="w-6 h-6 text-[#fbbc04]" />
                      </div>
                    </div>
                    <p className="text-xs text-[#8a8a9a] mt-3">{data?.correctAttempts || 0} correct answers</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#8a8a9a] text-sm">Study Time</p>
                        <p className="text-3xl font-bold text-white mt-1">{data?.studyHours || 0}h</p>
                      </div>
                      <div className="w-12 h-12 rounded-sm bg-[#9333ea]/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-[#9333ea]" />
                      </div>
                    </div>
                    <p className="text-xs text-[#8a8a9a] mt-3">{data?.streakDays || 0} day streak</p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#0066cc]" />
                        Weekly Study Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data?.dailyStudyStats || []}>
                            <XAxis dataKey="day" stroke="#8a8a9a" fontSize={12} />
                            <YAxis stroke="#8a8a9a" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0a0a0f',
                                border: '1px solid #1f1f2e',
                                borderRadius: '4px',
                              }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="hours" fill="#0066cc" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-[#8a8a9a] text-sm">Total this week</p>
                        <p className="text-2xl font-bold text-white">{data?.weeklyTotal || 0}h</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#34a853]" />
                        Accuracy Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={accuracyData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {accuracyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0a0a0f',
                                border: '1px solid #1f1f2e',
                                borderRadius: '4px',
                              }}
                              labelStyle={{ color: '#fff' }}
                            />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4">
                        {accuracyData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[#8a8a9a] text-sm">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#ea4335]" />
                        Weak Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data?.weakTopics && data.weakTopics.length > 0 ? (
                        <div className="space-y-3">
                          {data.weakTopics.slice(0, 5).map((topic, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-sm bg-[#1a1a24]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-sm bg-[#ea4335]/20 flex items-center justify-center">
                                  <span className="text-[#ea4335] font-bold text-sm">{index + 1}</span>
                                </div>
                                <span className="text-white text-sm">{topic.topicName || 'Unknown Topic'}</span>
                              </div>
                              <Badge className="bg-[#ea4335]/20 text-[#ea4335]">
                                {topic.wrongCount} wrong
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-[#1f1f2e] mx-auto mb-3" />
                          <p className="text-[#8a8a9a]">No weak topics yet. Keep practicing!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#0066cc]" />
                        Recent Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data?.recentSessions && data.recentSessions.length > 0 ? (
                        <div className="space-y-3">
                          {data.recentSessions.slice(0, 5).map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-3 rounded-sm bg-[#1a1a24]">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-sm bg-[#0066cc]/20 flex items-center justify-center">
                                  <Badge className="bg-[#0066cc]/20 text-[#0066cc] text-xs">
                                    {session.mode}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-white text-sm">{session.totalQuestions} questions</p>
                                  <p className="text-[#8a8a9a] text-xs">
                                    {new Date(session.startedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium">{session.accuracy}%</p>
                                <p className="text-[#8a8a9a] text-xs">{session.correctCount}/{session.totalQuestions}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-[#1f1f2e] mx-auto mb-3" />
                          <p className="text-[#8a8a9a]">No sessions yet. Start a quiz!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#34a853]" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 rounded-sm bg-[#1a1a24]">
                        <p className="text-4xl font-bold text-[#0066cc]">{data?.completedTopics || 0}</p>
                        <p className="text-[#8a8a9a] mt-2">Topics Completed</p>
                        <Progress value={data?.completionPercentage || 0} className="mt-3 h-2" />
                        <p className="text-xs text-[#8a8a9a] mt-2">{data?.completionPercentage || 0}% complete</p>
                      </div>
                      <div className="text-center p-4 rounded-sm bg-[#1a1a24]">
                        <p className="text-4xl font-bold text-[#34a853]">{data?.totalTopics || 0}</p>
                        <p className="text-[#8a8a9a] mt-2">Total Topics</p>
                        <p className="text-xs text-[#8a8a9a] mt-2">In your syllabus</p>
                      </div>
                      <div className="text-center p-4 rounded-sm bg-[#1a1a24]">
                        <p className="text-4xl font-bold text-[#fbbc04]">{data?.totalMcqs || 0}</p>
                        <p className="text-[#8a8a9a] mt-2">Available MCQs</p>
                        <p className="text-xs text-[#8a8a9a] mt-2">For practice</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}