'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Circle,
  Lightbulb,
  Target,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const aiActions = [
  { icon: Lightbulb, label: 'Explain', color: '#0066cc' },
  { icon: Target, label: 'Generate MCQs', color: '#34a853' },
  { icon: Sparkles, label: 'Summarize', color: '#fbbc04' },
];

interface Topic {
  id: string;
  title: string;
  order: number;
  _count?: { mcqs: number };
}

interface Unit {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
}

interface Syllabus {
  id: string;
  title: string;
  subject: { name: string };
  units: Unit[];
}

interface SyllabusOption {
  id: string;
  title: string;
  subjectName: string;
  unitCount: number;
}

export default function WorkspacePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<SyllabusOption[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syllabiLoading, setSyllabiLoading] = useState(true);

  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

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
            unitCount: s._count?.units || 0,
          }));
          setSyllabi(options);
          if (options.length > 0 && !selectedSyllabusId) {
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
    async function fetchSyllabusDetail() {
      if (!selectedSyllabusId) return;
      try {
        const res = await fetch(`/api/syllabus?subjectId=${selectedSyllabusId}`);
        if (res.ok) {
          const data = await res.json();
          setSyllabus(data);
          setSelectedTopic(null);
          setExpandedUnits([]);
        }
      } catch (error) {
        console.error('Failed to fetch syllabus:', error);
      }
    }
    if (selectedSyllabusId) {
      fetchSyllabusDetail();
    }
  }, [selectedSyllabusId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused]);

  const startTimer = async () => {
    try {
      const res = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', topicId: selectedTopic?.id }),
      });
      const timer = await res.json();
      setActiveTimerId(timer.id);
      setTimerActive(true);
      setTimerPaused(false);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const pauseTimer = async () => {
    if (!activeTimerId) return;
    try {
      await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause', timerId: activeTimerId }),
      });
      setTimerPaused(true);
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  };

  const resumeTimer = async () => {
    if (!activeTimerId) return;
    try {
      await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', timerId: activeTimerId }),
      });
      setTimerPaused(false);
    } catch (error) {
      console.error('Failed to resume timer:', error);
    }
  };

  const stopTimer = async () => {
    if (!activeTimerId) return;
    try {
      await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', timerId: activeTimerId }),
      });
      setTimerActive(false);
      setTimerPaused(false);
      setActiveTimerId(null);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <div className="flex h-[calc(100vh-4rem)]">
          <div className="w-72 border-r border-[#1f1f2e] bg-[#0a0a0f] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#1f1f2e]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-semibold">Syllabus</h2>
              </div>
              {syllabiLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : syllabi.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#8a8a9a] text-sm mb-2">No syllabi found</p>
                  <Button size="sm" onClick={() => router.push('/admin')} className="bg-[#0066cc] hover:bg-[#0052a3]">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Syllabus
                  </Button>
                </div>
              ) : (
                <Select value={selectedSyllabusId} onValueChange={setSelectedSyllabusId}>
                  <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white text-sm">
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
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full mb-2" />
                  ))
                ) : syllabus?.units && syllabus.units.length > 0 ? (
                  syllabus.units.map((unit) => (
                    <div key={unit.id}>
                      <button
                        onClick={() => toggleUnit(unit.id)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-sm text-left transition-colors text-[#8a8a9a] hover:bg-[#1a1a24] hover:text-white"
                      >
                        {expandedUnits.includes(unit.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <Circle className="w-4 h-4" />
                        <span className="text-sm flex-1">{unit.title}</span>
                        <span className="text-xs text-[#8a8a9a]">{unit.topics.length}</span>
                      </button>

                      <AnimatePresence>
                        {expandedUnits.includes(unit.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-6 mt-1 space-y-1"
                          >
                            {unit.topics.map((topic) => (
                              <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 rounded-sm text-xs transition-colors",
                                  selectedTopic?.id === topic.id
                                    ? "text-[#0066cc] bg-[#0066cc]/10"
                                    : "text-[#8a8a9a] hover:text-white"
                                )}
                              >
                                {topic.title}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#8a8a9a] py-8">
                    {syllabi.length === 0 ? 'Add a syllabus first' : 'No units in this syllabus'}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col bg-[#050508] overflow-hidden">
            {selectedTopic && (
              <div className="p-4 border-b border-[#1f1f2e] bg-[#0a0a0f]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#0066cc]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#0066cc]" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">{selectedTopic.title}</h2>
                      <p className="text-[#8a8a9a] text-sm">
                        {timerActive ? (
                          <span className="text-[#34a853]">{formatTime(elapsedTime)}</span>
                        ) : (
                          'Study timer'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!timerActive ? (
                      <Button onClick={startTimer} className="bg-[#0066cc] hover:bg-[#0052a3]">
                        <Play className="w-4 h-4 mr-2" />
                        Start Timer
                      </Button>
                    ) : timerPaused ? (
                      <Button onClick={resumeTimer} className="bg-[#34a853] hover:bg-[#2d8f4a]">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="outline" className="border-[#1f1f2e]">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    {timerActive && (
                      <Button onClick={stopTimer} variant="outline" className="border-[#dc2626] text-[#dc2626]">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 p-6">
              {selectedTopic ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-card p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">{selectedTopic.title}</h3>
                  <p className="text-[#8a8a9a] leading-relaxed">
                    Study this topic thoroughly. Use the AI tools on the right for explanations, summaries, and practice questions.
                  </p>
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {aiActions.map((action) => (
                        <button
                          key={action.label}
                          className="p-4 rounded-sm border border-[#1f1f2e] hover:border-[#0066cc]/30 transition-colors text-left"
                        >
                          <action.icon className="w-6 h-6 mb-2" style={{ color: action.color }} />
                          <span className="text-white text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-[#1f1f2e] mx-auto mb-4" />
                    <h3 className="text-white text-lg mb-2">Select a topic to start learning</h3>
                    <p className="text-[#8a8a9a] mb-4">Choose a topic from the syllabus sidebar</p>
                    {syllabi.length === 0 && (
                      <Button onClick={() => router.push('/admin')} className="bg-[#0066cc] hover:bg-[#0052a3]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Syllabus
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="w-80 border-l border-[#1f1f2e] bg-[#0a0a0f] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#1f1f2e]">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0066cc]" />
                AI Tools
              </h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {aiActions.map((action) => (
                  <button
                    key={action.label}
                    className="w-full p-4 rounded-sm bg-[#1a1a24] hover:bg-[#252530] transition-colors text-left"
                  >
                    <action.icon className="w-5 h-5 mb-2" style={{ color: action.color }} />
                    <span className="text-white font-medium">{action.label}</span>
                    <p className="text-[#8a8a9a] text-xs mt-1">
                      {action.label === 'Explain' && 'Get AI explanation'}
                      {action.label === 'Generate MCQs' && 'Create practice questions'}
                      {action.label === 'Summarize' && 'Get topic summary'}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}