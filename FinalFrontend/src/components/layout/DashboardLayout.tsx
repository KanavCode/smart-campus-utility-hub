import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <Sidebar />
      <Header />
      <main className="ml-20 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};
