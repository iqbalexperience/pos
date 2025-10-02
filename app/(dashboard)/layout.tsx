"use client";
import React, { useEffect, useState } from 'react';
import { SidebarWrap } from '@/components/shared/sidebar-wrap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Avoid rendering on the server until the client is ready
  }

  return (
    <div className="flex min-h-screen">
      <SidebarWrap />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}