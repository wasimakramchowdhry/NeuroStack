import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuthStore } from '../../store/authStore';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      {isAuthenticated && <MobileNav />}
      <main className={isAuthenticated ? 'lg:ml-32 px-6 pb-24 lg:pb-6' : 'px-6 pb-6'}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}