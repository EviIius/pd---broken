import React, { ReactNode } from 'react';
import PlatformHeader from './PlatformHeader';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PlatformHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
