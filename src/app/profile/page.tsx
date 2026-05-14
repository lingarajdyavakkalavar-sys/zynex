'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Target,
  TrendingUp,
  Clock,
  Flame,
  Save,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppLayout } from '@/components/app-layout';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  branchId: string | null;
  semesterId: string | null;
  examType: string;
  targetExam: string | null;
  phone: string | null;
  bio: string | null;
  studyHours: number;
  streakDays: number;
}

interface StudyAnalytics {
  weeklyHours: number;
  totalStudyHours: number;
  completedTopics: number;
  totalTopicsTracked: number;
  backlogCount: number;
  streakDays: number;
  mcqStats: {
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
  };
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  number: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    branchId: '',
    semesterId: '',
    examType: 'GATE',
    targetExam: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await fetch('/api/profile');
        const analyticsRes = await fetch('/api/analytics');
        const branchesRes = await fetch('/api/branches');
        const semestersRes = await fetch('/api/semesters');

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setFormData({
            name: profileData.name || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            branchId: profileData.branchId || '',
            semesterId: profileData.semesterId || '',
            examType: profileData.examType || 'GATE',
            targetExam: profileData.targetExam || '',
          });
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData);
        }

        if (semestersRes.ok) {
          const semestersData = await semestersRes.json();
          setSemesters(semestersData);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded && user) {
      loadData();
    }
  }, [isLoaded, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066cc]" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-[#8a8a9a] mt-1">Manage your account and study preferences</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#0066cc] hover:bg-[#0052a3]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#0066cc]" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20 border-2 border-[#0066cc]/30">
                    <AvatarImage src={user?.imageUrl || profile?.imageUrl || ''} />
                    <AvatarFallback className="text-2xl bg-[#1a1a24] text-white">
                      {user?.firstName?.charAt(0) || profile?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {user?.fullName || profile?.name || 'User'}
                    </h3>
                    <p className="text-[#8a8a9a]">{user?.primaryEmailAddress?.emailAddress || profile?.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#1a1a24] border-[#1f1f2e] text-white"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-[#1a1a24] border-[#1f1f2e] text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#8a8a9a]">Bio</Label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full h-24 p-3 rounded-lg bg-[#1a1a24] border border-[#1f1f2e] text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Info Card */}
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#0066cc]" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Branch</Label>
                    <Select 
                      value={formData.branchId} 
                      onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                    >
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id} className="text-white">
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Semester</Label>
                    <Select 
                      value={formData.semesterId} 
                      onValueChange={(value) => setFormData({ ...formData, semesterId: value })}
                    >
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        {semesters.map((sem) => (
                          <SelectItem key={sem.id} value={sem.id} className="text-white">
                            Semester {sem.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Exam Type</Label>
                    <Select 
                      value={formData.examType} 
                      onValueChange={(value) => setFormData({ ...formData, examType: value })}
                    >
                      <SelectTrigger className="bg-[#1a1a24] border-[#1f1f2e] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-[#1f1f2e]">
                        <SelectItem value="GATE" className="text-white">GATE</SelectItem>
                        <SelectItem value="CAT" className="text-white">CAT</SelectItem>
                        <SelectItem value="SEMESTER" className="text-white">Semester</SelectItem>
                        <SelectItem value="UNIVERSITY" className="text-white">University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#8a8a9a]">Target Exam</Label>
                    <Input
                      value={formData.targetExam}
                      onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                      className="bg-[#1a1a24] border-[#1f1f2e] text-white"
                      placeholder="e.g., GATE 2026, CAT 2025"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Study Stats */}
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardHeader>
                <CardTitle className="text-white">Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24]">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-[#8a8a9a]">Streak</span>
                  </div>
                  <span className="text-white font-semibold">{analytics?.streakDays || 0} days</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24]">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-[#8a8a9a]">Total Hours</span>
                  </div>
                  <span className="text-white font-semibold">{analytics?.totalStudyHours || 0}h</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24]">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <span className="text-[#8a8a9a]">Topics Completed</span>
                  </div>
                  <span className="text-white font-semibold">{analytics?.completedTopics || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24]">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span className="text-[#8a8a9a]">MCQ Accuracy</span>
                  </div>
                  <span className="text-white font-semibold">{analytics?.mcqStats?.accuracy || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Exam Prep Info */}
            <Card className="bg-[#0a0a0f] border-[#1f1f2e]">
              <CardHeader>
                <CardTitle className="text-white">Preparation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a8a9a]">Backlog Topics</span>
                  <Badge className="bg-amber-500/20 text-amber-500">{analytics?.backlogCount || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8a8a9a]">MCQ Attempts</span>
                  <Badge className="bg-blue-500/20 text-blue-500">{analytics?.mcqStats?.totalAttempts || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8a8a9a]">Correct Answers</span>
                  <Badge className="bg-emerald-500/20 text-emerald-500">{analytics?.mcqStats?.correctAttempts || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8a8a9a]">Weekly Study</span>
                  <Badge className="bg-purple-500/20 text-purple-500">{analytics?.weeklyHours || 0}h</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}