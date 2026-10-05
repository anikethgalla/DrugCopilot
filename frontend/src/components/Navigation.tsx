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
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, role, isAuthenticated, logout, switchPortal, portalMode } = useAuth();

  // Dynamic Navigation Items based on RBAC
  const baseNavItems = [
    { href: '/copilot', label: 'AI Copilot', icon: Bot, badge: 'Agent' },
    { href: '/explore', label: 'Graph Explorer', icon: Network },
    { href: '/drugs', label: 'Drugs', icon: Pill },
    { href: '/diseases', label: 'Diseases', icon: Dna },
    { href: '/trials', label: 'Clinical Trials', icon: FlaskConical },
  ];

  const adminNavItem = { href: '/admin', label: 'ETL & Ingestion', icon: Database, badge: 'Admin' };

  const navItems = role === 'admin' ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Product Identity */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised border border-surface-border text-white group-hover:border-white/40 transition-colors shadow-specular">
              <Network className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-white">DrugCopilot</span>
              {role === 'admin' ? (
                <span className="rounded bg-white/10 border border-white/20 px-1.5 py-0.2 text-[9px] font-mono text-gray-200 font-bold uppercase tracking-wider">
                  ADMIN
                </span>
              ) : isAuthenticated ? (
                <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[9px] font-mono text-gray-400 font-medium uppercase tracking-wider">
                  RESEARCHER
                </span>
              ) : null}
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive 
                      ? "bg-surface-raised text-white border border-surface-border shadow-specular font-semibold" 
                      : "text-gray-400 hover:text-white hover:bg-surface-raised/60"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-gray-400")} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "rounded px-1 py-0.2 text-[9px] font-mono font-semibold",
                      item.badge === 'Admin' ? "bg-white/20 text-white" : "bg-white/10 text-gray-200"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Portal Switcher, User Menu & Action */}
        <div className="flex items-center space-x-3">
          
          {/* Admin Portal Quick Switcher (Visible only if Admin) */}
          {role === 'admin' && (
            <button
              onClick={() => switchPortal(pathname.startsWith('/admin') ? 'user' : 'admin')}
              className="hidden lg:inline-flex items-center space-x-1.5 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-2.5 py-1.5 text-xs font-mono text-gray-300 hover:text-white transition-all shadow-specular"
              title="Toggle Portal View"
            >
              <Layers className="h-3.5 w-3.5 text-gray-300" />
              <span>{pathname.startsWith('/admin') ? 'View Researcher Portal' : 'View Admin Hub'}</span>
            </button>
          )}

          {/* User Auth Pill / Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center space-x-2 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-2.5 py-1.5 text-xs font-mono text-gray-200 transition-all shadow-specular"
              >
                <div className="h-4 w-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">
                  {user.role === 'admin' ? 'A' : 'R'}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-surface-border bg-surface-raised p-2 shadow-specular-strong z-50 space-y-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-2.5 py-2 border-b border-surface-border">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] font-mono text-gray-400 truncate">{user.email}</div>
                    <div className="mt-1 inline-flex items-center space-x-1 rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-gray-200 uppercase font-bold">
                      <span>{user.role} role</span>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-200 hover:bg-surface-overlay hover:text-white transition-colors"
                    >
                      <Database className="h-3.5 w-3.5 text-gray-400" />
                      <span>Admin Command Center</span>
                    </Link>
                  )}

                  <Link
                    href="/copilot"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-200 hover:bg-surface-overlay hover:text-white transition-colors"
                  >
                    <Bot className="h-3.5 w-3.5 text-gray-400" />
                    <span>Researcher Copilot</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-specular"
            >
              <LogIn className="h-3.5 w-3.5 text-gray-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Quick Launch Copilot */}
          <Link
            href="/copilot"
            className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-xs font-bold transition-all shadow-specular-strong"
          >
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span className="hidden sm:inline">Launch Copilot</span>
            <span className="sm:hidden">Copilot</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-surface-raised"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-surface px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium",
                  isActive ? "bg-surface-raised text-white font-bold" : "text-gray-300 hover:bg-surface-raised"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4 w-4 text-gray-300" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-white/10 border border-white/20 px-1.5 py-0.5 text-[10px] text-gray-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-surface-border">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium text-red-400 hover:bg-surface-raised"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user?.email})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium text-white hover:bg-surface-raised"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In / Switch Portal</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
