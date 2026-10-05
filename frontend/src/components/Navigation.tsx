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
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/copilot', label: 'AI Copilot', icon: Bot, badge: 'Agent' },
  { href: '/explore', label: 'Graph Explorer', icon: Network },
  { href: '/drugs', label: 'Drugs', icon: Pill },
  { href: '/diseases', label: 'Diseases', icon: Dna },
  { href: '/trials', label: 'Clinical Trials', icon: FlaskConical },
  { href: '/admin', label: 'ETL & Ingestion', icon: Database },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Product Identity */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised border border-surface-border text-white group-hover:border-white/40 transition-colors shadow-specular">
              <Network className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">DrugCopilot</span>
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
                    <span className="rounded bg-white/10 border border-white/20 px-1 py-0.2 text-[9px] font-mono text-gray-200 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Quick Action */}
        <div className="flex items-center space-x-3">
          {/* Quick Launch Button */}
          <Link
            href="/copilot"
            className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-xs font-bold transition-all shadow-specular-strong"
          >
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span>Launch Copilot</span>
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
        </div>
      )}
    </header>
  );
}
