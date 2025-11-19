'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import DashboardLayout from '@/components/dashboard-layout';

interface DashboardGroupLayoutProps {
  children: ReactNode;
}


const routeConfig = {
  '/dashboard': { title: 'Dashboard', activeTab: 'todos' as const },
  '/profile': { title: 'Account Information', activeTab: 'profile' as const },
};

export default function DashboardGroupLayout({ children }: DashboardGroupLayoutProps) {
  const pathname = usePathname();
  

  const currentConfig = routeConfig[pathname as keyof typeof routeConfig] || routeConfig['/dashboard'];

  return (
    <ProtectedRoute>
      <DashboardLayout activeTab={currentConfig.activeTab}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}