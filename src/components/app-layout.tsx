'use client';

import { useState, ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopNavbar } from './top-navbar';

interface AppLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-[#050508]">
      {!hideSidebar && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />}
      {!hideSidebar && <TopNavbar />}
      <main className={hideSidebar ? 'min-h-screen' : collapsed ? 'pl-[72px] pt-16' : 'pl-[280px] pt-16'}>
        {children}
      </main>
    </div>
  );
}