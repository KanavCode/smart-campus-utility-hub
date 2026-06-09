import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { BugReportWidget } from '../ui/BugReportWidget';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <Sidebar />
      <Header />
      <main className="ml-20 mt-16 p-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <BugReportWidget />
    </div>
  );
};
