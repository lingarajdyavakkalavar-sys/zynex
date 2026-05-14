'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';

interface AppLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050508]">
      {!hideSidebar && <Sidebar />}
      {!hideSidebar && <TopNavbar />}
      <main className={hideSidebar ? 'min-h-screen' : 'pl-[280px] pt-16'}>
        {children}
      </main>
    </div>
  );
}