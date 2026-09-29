import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/ui/Navigation';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Precedent — On-Call Memory-Backed Incident Response',
  description:
    'On-call incident response agent that recalls previous outages, surfaces verified fixes, and warns against repeat failure modes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-bg text-text font-sans selection:bg-primary-soft selection:text-primary">
        <ToastProvider>
          <Navigation />
          <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-6">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
