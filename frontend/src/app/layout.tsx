import type { Metadata } from 'next';
import '@/styles/globals.css';
import Navigation from '@/components/Navigation';
import MedicalDisclaimer from '@/components/MedicalDisclaimer';

export const metadata: Metadata = {
  title: 'DrugCopilot - AI Drug Repurposing Knowledge Graph',
  description: 'Evidence-backed AI Drug Repurposing Copilot powered by Neo4j biomedical knowledge graph and live biomedical APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-gray-100 antialiased">
        <MedicalDisclaimer />
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
