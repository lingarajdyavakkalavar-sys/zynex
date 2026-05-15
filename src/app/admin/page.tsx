'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/sidebar';
import { EXAMS, GATE_BRANCHES, CAT_SECTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Syllabus {
  id: string;
  title: string;
  isPublished: boolean;
  subject: {
    name: string;
    code: string;
    branchCode: string | null;
    section: string | null;
  };
  _count: { units: number };
  createdAt: string;
}

export default function AdminPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('GATE');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchSyllabi() {
      try {
        const res = await fetch(`/api/syllabus?examType=${selectedExam}`);
        if (res.ok) {
          const data = await res.json();
          setSyllabi(data);
        }
      } catch (error) {
        console.error('Failed to fetch syllabi:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isSignedIn) {
      fetchSyllabi();
    }
  }, [isSignedIn, selectedExam]);

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      await fetch('/api/syllabus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: !isPublished }),
      });
      setSyllabi(syllabi.map(s => s.id === id ? { ...s, isPublished: !isPublished } : s));
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const deleteSyllabus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this syllabus?')) return;
    try {
      await fetch(`/api/syllabus?id=${id}`, { method: 'DELETE' });
      setSyllabi(syllabi.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete syllabus:', error);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-[#34a853]/20 text-[#34a853]' : 'bg-[#8a8a9a]/20 text-[#8a8a9a]';
  };

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Syllabus Manager</h1>
              <p className="text-[#8a8a9a]">Manage and publish course syllabi</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-[#1f1f2e] text-white" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import PDF
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <button className="hidden">Open</button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Syllabus</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#8a8a9a]">Title</Label>
                      <Input placeholder="Syllabus title" className="bg-[#1a1a24] border-[#1f1f2e] text-white mt-1" />
                    </div>
                    <div>
                      <Label className="text-[#8a8a9a]">Description</Label>
                      <Input placeholder="Brief description" className="bg-[#1a1a24] border-[#1f1f2e] text-white mt-1" />
                    </div>
                    <Button className="w-full bg-[#0066cc] hover:bg-[#0052a3]">
                      Create Syllabus
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent className="bg-[#0a0a0f] border-[#1f1f2e] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Import Questions from PDF</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#8a8a9a]">Select Exam</Label>
                      <Select value={selectedExam} onValueChange={setSelectedExam}>
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
                    <div className="border-2 border-dashed border-[#2a2a3a] rounded-lg p-6 text-center hover:border-[#0066cc] transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-[#8a8a9a] mx-auto mb-2" />
                      <p className="text-white text-sm">Click to upload PDF</p>
                      <p className="text-[#8a8a9a] text-xs mt-1">or drag and drop</p>
                      <input type="file" accept=".pdf" className="hidden" />
                    </div>
                    <div className="text-xs text-[#8a8a9a]">
                      PDF will be processed using AI to extract MCQs
                    </div>
                    <Button 
                      className="w-full bg-[#0066cc] hover:bg-[#0052a3]"
                      onClick={() => {
                        alert('PDF import would call /api/ingest/mcq endpoint');
                        setShowImportDialog(false);
                      }}
                    >
                      Process PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button onClick={() => setShowAddDialog(true)} className="bg-[#0066cc] hover:bg-[#0052a3]">
                <Plus className="w-4 h-4 mr-2" />
                Add Syllabus
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#8a8a9a] text-xs">Exam Type</Label>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
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
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">All Syllabi</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9a]" />
                    <Input
                      placeholder="Search syllabi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-[#1a1a24] border-[#1f1f2e] text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#1f1f2e]">
                          <TableHead className="text-[#8a8a9a]">Exam</TableHead>
                          <TableHead className="text-[#8a8a9a]">Subject</TableHead>
                          <TableHead className="text-[#8a8a9a]">Section</TableHead>
                          <TableHead className="text-[#8a8a9a]">Units</TableHead>
                          <TableHead className="text-[#8a8a9a]">Status</TableHead>
                          <TableHead className="text-[#8a8a9a]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {syllabi.length > 0 ? syllabi.map((item) => (
                          <TableRow key={item.id} className="border-[#1f1f2e]">
                            <TableCell className="text-white">{selectedExam}</TableCell>
                            <TableCell className="text-white">{item.subject.name}</TableCell>
                            <TableCell className="text-white">{item.subject.section || item.subject.branchCode || '-'}</TableCell>
                            <TableCell className="text-[#8a8a9a]">{item._count.units}</TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', getStatusColor(item.isPublished))}>
                                {item.isPublished ? (
                                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Published</>
                                ) : (
                                  <><Clock className="w-3 h-3 mr-1" /> Draft</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-[#8a8a9a] hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-[#8a8a9a] hover:text-white"
                                  onClick={() => togglePublish(item.id, item.isPublished)}
                                >
                                  {item.isPublished ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-[#dc2626] hover:text-[#dc2626]"
                                  onClick={() => deleteSyllabus(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-[#8a8a9a] py-8">
                              No syllabi found. Create one to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}