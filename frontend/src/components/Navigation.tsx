'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dna, 
  Bot, 
  Network, 
  Pill, 
  Activity, 
  FlaskConical, 
  FileCheck2, 
  Database 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/copilot', label: 'AI Copilot', icon: Bot },
  { href: '/explore', label: 'Graph Explorer', icon: Network },
  { href: '/drugs', label: 'Drugs', icon: Pill },
  { href: '/diseases', label: 'Diseases', icon: Dna },
  { href: '/trials', label: 'Clinical Trials', icon: FlaskConical },
  { href: '/evidence', label: 'Evidence', icon: FileCheck2 },
  { href: '/admin', label: 'Ingestion & Data', icon: Database },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Dna className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">DrugCopilot</span>
            <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
              Neo4j Biomedical AI
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-surface-raised"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
