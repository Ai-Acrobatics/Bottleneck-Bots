import React from 'react';
import { AdminNav } from './AdminNav';
import { User, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  userName = 'Admin',
  userEmail = 'admin@example.com',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">System Administration</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50">
          <AdminNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
