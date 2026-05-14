'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Brain,
  CreditCard,
  Calculator,
  Search,
  Plus,
  Pin,
  Edit,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'mindmap', label: 'Mind Map', icon: Brain },
  { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
  { id: 'formulas', label: 'Formulas', icon: Calculator },
];

interface Note {
  id: string;
  title: string;
  content: string;
  topic: { title: string };
  pinned: boolean;
  updatedAt: string;
}

export default function NotebookPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
          if (data.length > 0) {
            setSelectedNote(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isSignedIn) {
      fetchNotes();
    }
  }, [isSignedIn]);

  const createNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: 'topic-1',
          title: newNoteTitle,
          content: newNoteContent,
        }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes([note, ...notes]);
        setSelectedNote(note);
        setShowNewNote(false);
        setNewNoteTitle('');
        setNewNoteContent('');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#050508]">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="pl-[280px] pt-16">
        <div className="h-[calc(100vh-4rem)] flex">
          <div className="w-80 border-r border-[#1f1f2e] bg-[#0a0a0f] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#1f1f2e]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Notebook</h2>
                <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
                  <DialogTrigger asChild>
                    <button className="hidden">Open</button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="bg-[#1a1a24] border-[#1f1f2e] text-white"
                      />
                      <Textarea
                        placeholder="Content"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="bg-[#1a1a24] border-[#1f1f2e] text-white min-h-[200px]"
                      />
                      <Button onClick={createNote} className="w-full bg-[#0066cc] hover:bg-[#0052a3]">
                        Save Note
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => setShowNewNote(true)} size="sm" className="bg-[#0066cc] hover:bg-[#0052a3]">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a9a]" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#1a1a24] border-[#1f1f2e] text-white"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loading ? (
                  <p className="text-center text-[#8a8a9a] py-8">Loading...</p>
                ) : notes.length > 0 ? (
                  notes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={cn(
                        'w-full text-left p-3 rounded-sm transition-colors',
                        selectedNote?.id === note.id
                          ? 'bg-[#0066cc]/20 border-l-2 border-[#0066cc]'
                          : 'hover:bg-[#1a1a24]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {note.pinned && <Pin className="w-3 h-3 text-[#fbbc04]" />}
                            <h3 className="text-white font-medium truncate">{note.title}</h3>
                          </div>
                          <p className="text-[#8a8a9a] text-xs mt-1 truncate">{note.topic.title}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-[#8a8a9a] py-8">No notes yet. Create one!</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col bg-[#050508] overflow-hidden">
            <div className="p-4 border-b border-[#1f1f2e] bg-[#0a0a0f]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#1a1a24]">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-[#0066cc]">
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'summary' && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {selectedNote ? (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h1 className="text-2xl font-bold text-white">{selectedNote.title}</h1>
                            <p className="text-[#8a8a9a]">{selectedNote.topic.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-[#8a8a9a]">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="premium-card p-6">
                          <p className="text-[#8a8a9a] leading-relaxed whitespace-pre-wrap">
                            {selectedNote.content}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-[#1f1f2e] mx-auto mb-4" />
                        <h3 className="text-white text-lg mb-2">Select a note to view</h3>
                        <p className="text-[#8a8a9a]">Choose from your notes or create a new one</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'mindmap' && (
                  <motion.div
                    key="mindmap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-20"
                  >
                    <Brain className="w-16 h-16 text-[#1f1f2e] mx-auto mb-4" />
                    <h3 className="text-white text-lg mb-2">Mind Map View</h3>
                    <p className="text-[#8a8a9a] mb-6">Visual representation of topic relationships</p>
                    <Button className="bg-[#0066cc] hover:bg-[#0052a3]">
                      Generate Mind Map
                    </Button>
                  </motion.div>
                )}

                {activeTab === 'flashcards' && (
                  <motion.div
                    key="flashcards"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl mx-auto"
                  >
                    <div className="text-center mb-4">
                      <p className="text-[#8a8a9a]">Flashcard {currentFlashcard + 1} of 10</p>
                    </div>
                    <button
                      onClick={() => setShowFlashcard(!showFlashcard)}
                      className="w-full min-h-[300px] premium-card p-8 flex items-center justify-center cursor-pointer"
                    >
                      <div className="text-center">
                        <p className={cn('text-xl text-white font-medium', showFlashcard && 'hidden')}>
                          What is a Binary Search Tree?
                        </p>
                        <p className={cn('text-xl text-[#34a853] font-medium', !showFlashcard && 'hidden')}>
                          A hierarchical data structure where each node has at most two children
                        </p>
                        <p className="text-[#8a8a9a] text-sm mt-4">
                          Click to {showFlashcard ? 'see question' : 'reveal answer'}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentFlashcard(Math.max(0, currentFlashcard - 1))}
                        className="border-[#1f1f2e] text-white"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentFlashcard(Math.min(9, currentFlashcard + 1))}
                        className="bg-[#0066cc] hover:bg-[#0052a3]"
                      >
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'formulas' && (
                  <motion.div
                    key="formulas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl mx-auto"
                  >
                    <h2 className="text-xl font-bold text-white mb-6">Important Formulas</h2>
                    <div className="space-y-3">
                      {[
                        { formula: 'Time Complexity: O(n²)', topic: 'Sorting' },
                        { formula: 'Space Complexity: O(n)', topic: 'Recursion' },
                        { formula: 'BST Search: O(log n)', topic: 'Trees' },
                        { formula: 'Array Access: O(1)', topic: 'Arrays' },
                        { formula: 'DFS Stack: O(V + E)', topic: 'Graphs' },
                      ].map((item, i) => (
                        <div key={i} className="premium-card p-4 flex items-center justify-between">
                          <span className="text-white font-mono">{item.formula}</span>
                          <Badge className="bg-[#1a1a24] text-[#8a8a9a]">{item.topic}</Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}