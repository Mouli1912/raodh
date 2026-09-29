'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BrainCircuit, Menu, X, Cpu, MonitorPlay } from 'lucide-react';
import { IS_MOCK_MODE } from '@/lib/api';

const navItems = [
  { label: 'Incidents', href: '/' },
  { label: 'Deploys', href: '/deploys' },
  { label: 'Insights', href: '/insights' },
  { label: 'Replay', href: '/replay' },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDemoView, setIsDemoView] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        setIsDemoView((prev) => {
          const next = !prev;
          if (next) {
            document.body.setAttribute('data-demo', 'true');
          } else {
            document.body.removeAttribute('data-demo');
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/incidents');
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border h-14 no-print shadow-xs">
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-primary rounded-btn py-1"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text text-base tracking-tight">
                Precedent
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                On-Call Agent
              </span>
            </div>
          </Link>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 h-14">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'relative h-14 px-3 flex items-center text-sm font-medium transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text hover:bg-slate-50'
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Team chip, Demo view badge, & Avatar */}
        <div className="flex items-center gap-3">
          {isDemoView && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-primary-soft text-primary border border-primary/30 animate-fadeIn"
              title="Demo View active (press 'd' to toggle standard size)"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              Demo view (16px)
            </span>
          )}

          {IS_MOCK_MODE && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-violet-50 text-violet-700 border border-violet-200">
              <Cpu className="w-3 h-3" />
              Demo Mode
            </span>
          )}

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-text">SRE Primary</span>
          </div>

          <div
            className="w-8 h-8 rounded-full bg-primary-soft border border-primary/20 text-primary font-semibold text-xs flex items-center justify-center select-none"
            title="Logged in as alex.chen@team.internal"
          >
            AC
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-btn text-text-muted hover:text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-white px-6 py-3 shadow-lg flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'px-3 py-2 rounded-btn text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
