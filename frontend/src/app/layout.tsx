import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';
import Navigation from '@/components/Navigation';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'DrugCopilot - Computational Drug Repurposing Knowledge Graph',
  description: 'Evidence-backed AI Drug Repurposing Copilot powered by Neo4j biomedical knowledge graph and live public biomedical APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-gray-100 antialiased selection:bg-white/20 selection:text-white">
        <AuthProvider>
          <MedicalDisclaimer />
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
        
        {/* Discrete Minimal Monochrome Footer */}
        <footer className="w-full border-t border-surface-border bg-background py-4 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-gray-400">
            <div className="flex items-center space-x-3">
              <span>DrugCopilot &copy; {new Date().getFullYear()}</span>
              <span>•</span>
              <span className="text-gray-400">Computational Biomedical Knowledge Graph</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/evidence" className="hover:text-white transition-colors">
                W3C PROV-DM Standards
              </Link>
              <Link href="/admin" className="hover:text-white transition-colors">
                ETL Status
              </Link>
              <a
                href="https://github.com/anikethgalla/DrugCopilot"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
