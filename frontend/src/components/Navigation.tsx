'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Network, 
  Pill, 
  Dna, 
  FlaskConical, 
  Database, 
  Menu, 
  X, 
  ArrowUpRight,
  LogOut,
  ChevronDown,
  Layers,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, role, isAuthenticated, logout, switchPortal } = useAuth();

  // Navigation Items
  const baseNavItems = [
    { href: '/', label: 'Overview' },
    { href: '/copilot', label: 'Copilot', badge: 'AI' },
    { href: '/explore', label: 'Graph' },
    { href: '/drugs', label: 'Molecules' },
    { href: '/diseases', label: 'Diseases' },
    { href: '/trials', label: 'Trials' },
  ];

  const adminNavItem = { href: '/admin', label: 'ETL Ingestion', badge: 'Admin' };
  const navItems = role === 'admin' ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/20 group-hover:border-white/50 transition-all duration-300 shadow-sm">
            <Pill className="h-4 w-4 text-white transform group-hover:rotate-45 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-semibold tracking-tight text-white">
              Drug<span className="text-zinc-400 font-normal">Copilot</span>
            </span>
            {role === 'admin' ? (
              <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-mono text-zinc-300 font-medium uppercase tracking-wider">
                ADMIN
              </span>
            ) : isAuthenticated ? (
              <span className="rounded-full bg-zinc-900 border border-zinc-700 px-2 py-0.5 text-[9px] font-mono text-zinc-400 font-medium uppercase tracking-wider">
                RESEARCH
              </span>
            ) : null}
          </div>
        </Link>

        {/* Center Floating Pill Navigation (Inspired by Pinterest Reference) */}
        <nav className="hidden md:flex items-center space-x-1 rounded-full bg-zinc-900/60 border border-white/10 px-2 py-1 shadow-inner backdrop-blur-xl">
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname === item.href || pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  isActive 
                    ? "bg-white text-black shadow-sm font-semibold" 
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.2 text-[8px] font-mono font-medium",
                    isActive ? "bg-black/10 text-black" : "bg-white/10 text-zinc-300"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Auth & Primary Action Button */}
        <div className="flex items-center space-x-3">
          
          {/* Quick Portal Switcher (Admin only) */}
          {role === 'admin' && (
            <button
              onClick={() => switchPortal(pathname.startsWith('/admin') ? 'user' : 'admin')}
              className="hidden lg:inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white transition-all"
            >
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span>{pathname.startsWith('/admin') ? 'Researcher' : 'Admin Hub'}</span>
            </button>
          )}

          {/* User Auth Info / Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-1.5 text-xs font-mono text-zinc-200 transition-all"
              >
                <div className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-[9px] font-bold">
                  {user.role === 'admin' ? 'A' : 'R'}
                </div>
                <span className="max-w-[80px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-2 shadow-2xl z-50 space-y-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400 truncate">{user.email}</div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono text-zinc-200 uppercase font-bold">
                      {user.role} role
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Database className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Admin Command Center</span>
                    </Link>
                  )}

                  <Link
                    href="/copilot"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Bot className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Researcher Copilot</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-all"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Primary Action Button — Pure White Pill with Black Text (Like Pinterest Reference) */}
          <Link
            href="/copilot"
            className="group inline-flex items-center space-x-2 rounded-full bg-white hover:bg-zinc-200 text-black px-4 py-1.5 text-xs font-semibold shadow-specular transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>Launch Copilot</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors",
                  isActive ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user?.email})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
