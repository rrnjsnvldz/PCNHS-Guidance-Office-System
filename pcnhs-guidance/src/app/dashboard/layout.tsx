'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BookLock,
  FileText,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: '#0ea5e9',
  },
  {
    label: 'Student Directory',
    href: '/dashboard/students',
    icon: Users,
    color: '#10b981',
  },
  {
    label: 'Incident Logs',
    href: '/dashboard/incidents',
    icon: AlertTriangle,
    color: '#f59e0b',
  },
  {
    label: 'Counseling Vault',
    href: '/dashboard/counseling',
    icon: BookLock,
    color: '#8b5cf6',
  },
  {
    label: 'Call Slips',
    href: '/dashboard/call-slips',
    icon: FileText,
    color: '#06b6d4',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('pcnhs-dark-mode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pcnhs-dark-mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pcnhs-dark-mode', 'false');
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center">
            <Image
              src="https://wcdmkalavrqrppvzxapu.supabase.co/storage/v1/object/public/public-assets/PCNHS%20Logo.png"
              alt="PCNHS Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">PCNHS Guidance</h1>
            <p className="text-xs text-slate-400 truncate">Student Profiling System</p>
          </div>
          <button
            className="lg:hidden ml-auto text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                        boxShadow: `inset 3px 0 0 ${item.color}`,
                      }
                    : {}
                }
              >
                <item.icon
                  className="w-5 h-5 shrink-0 transition-colors"
                  style={{ color: active ? item.color : undefined }}
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 ml-auto shrink-0" style={{ color: item.color }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User info + Logout */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              SM
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Sir Mico</p>
              <p className="text-xs text-slate-500 truncate">Guidance Counselor</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex items-center gap-4 px-6 py-4 shrink-0"
          style={{
            background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid var(--color-border)`,
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="hidden sm:inline">Palayan City National High School</span>
            <span className="hidden sm:inline" style={{ color: 'var(--color-border)' }}>•</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                color: darkMode ? '#fbbf24' : '#64748b',
              }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: darkMode ? '#064e3b' : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                color: darkMode ? '#34d399' : '#065f46',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>

            {/* Logout Button (visible in top bar) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = darkMode ? '#7f1d1d30' : '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
