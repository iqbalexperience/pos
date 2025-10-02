import React from 'react';
import { SidebarWrap } from '@/components/shared/sidebar-wrap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarWrap />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}