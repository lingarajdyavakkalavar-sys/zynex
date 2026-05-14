'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Command, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockUser } from '@/lib/mock-data';

export function TopNavbar() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-[280px] h-16 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#1f1f2e] z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-3 py-2 rounded-sm border border-[#1f1f2e] text-[#8a8a9a] hover:border-[#0066cc]/50 hover:text-white transition-all"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-[#1a1a24] rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-[#8a8a9a] hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#0066cc] rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-[#1a1a24] transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#0066cc] text-white text-sm">AS</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm text-white font-medium">{mockUser.name}</span>
                <span className="text-xs text-[#8a8a9a] capitalize">{mockUser.examType} • Sem {mockUser.semester}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8a8a9a]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0f] border-[#1f1f2e]">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1f1f2e]" />
            <DropdownMenuItem className="text-[#8a8a9a] hover:text-white hover:bg-[#1a1a24]">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#8a8a9a] hover:text-white hover:bg-[#1a1a24]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1f1f2e]" />
            <DropdownMenuItem className="text-red-400 hover:text-red-400 hover:bg-[#1a1a24]">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-0 right-0 h-16 bg-[#0a0a0f] border-b border-[#1f1f2e] flex items-center px-6"
          >
            <div className="flex-1 max-w-xl">
              <Input
                placeholder="Search topics, notes, MCQs..."
                className="bg-[#1a1a24] border-[#1f1f2e] text-white placeholder:text-[#8a8a9a] focus:border-[#0066cc]"
                autoFocus
              />
            </div>
            <Button variant="ghost" onClick={() => setShowSearch(false)} className="ml-4 text-[#8a8a9a]">
              ESC
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}