'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Target,
  Calendar,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/workspace', icon: BookOpen, label: 'Learning' },
  { href: '/practice', icon: Target, label: 'Practice' },
  { href: '/planner', icon: Calendar, label: 'Planner' },
  { href: '/notebook', icon: FileText, label: 'Notebook' },
  { href: '/admin', icon: Layers, label: 'Admin', adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <SignedOut>
        <div className="fixed left-0 top-0 h-screen w-72 bg-[#0a0a0f] border-r border-[#1f1f2e] flex items-center justify-center">
          <Link href="/login" className="text-[#8a8a9a] hover:text-white">
            Sign in to continue
          </Link>
        </div>
      </SignedOut>
      <SignedIn>
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 72 : 280 }}
          className="fixed left-0 top-0 h-screen bg-[#0a0a0f] border-r border-[#1f1f2e] z-40 flex flex-col"
        >
          <div className="h-16 flex items-center px-4 border-b border-[#1f1f2e]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0066cc] to-[#003d80] flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <span className="text-white font-semibold text-lg whitespace-nowrap">
                  StudyHub
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 relative group',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-[#0066cc]/20 text-[#0066cc]'
                    : 'text-[#8a8a9a] hover:bg-[#1a1a24] hover:text-white'
                )}
              >
                {pathname === item.href || pathname.startsWith(item.href + '/') ? (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0066cc] rounded-r-full"
                  />
                ) : null}
                <item.icon className={cn('w-5 h-5 flex-shrink-0')} />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-[#1f1f2e] flex items-center justify-between">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={onToggle}
              className="p-2 text-[#8a8a9a] hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </motion.aside>
      </SignedIn>
    </>
  );
}