import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  QrCode,
  FileCheck,
  History as HistoryIcon,
  LogOut,
  Shield,
  ExternalLink
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'alumni-list'
  | 'alumni-add'
  | 'alumni-detail'
  | 'cards'
  | 'qr-codes'
  | 'verification-logs'
  | 'activity-logs';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  user: any;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  user,
  children
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'alumni-list', label: 'Alumni Directory', icon: Users },
    { id: 'alumni-add', label: 'Add Alumni', icon: UserPlus },
    { id: 'cards', label: 'Card Management', icon: CreditCard },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
    { id: 'verification-logs', label: 'Verification Logs', icon: FileCheck },
    { id: 'activity-logs', label: 'Activity Logs', icon: HistoryIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="space-y-0.5">
              <span className="font-serif text-sm sm:text-base font-bold tracking-wider uppercase block text-emerald-400">
                Panpacific University
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                Alumni Registry Administration
              </span>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {user?.email || 'admin@university.edu.ph'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Sign out of administrative console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Bar for Fast Switching */}
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'alumni-list' && currentTab === 'alumni-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-600">
        <p>
          Panpacific University · Integrated Alumni Management System (Admin Console v2.6)
        </p>
      </footer>
    </div>
  );
};
