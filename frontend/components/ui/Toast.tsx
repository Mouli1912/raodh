'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info' | 'memory';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  memory: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message }: { type?: ToastType; title: string; message?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: 'danger', title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);
  const memory = useCallback((title: string, message?: string) => toast({ type: 'memory', title, message }), [toast]);

  const borderColors: Record<ToastType, string> = {
    success: 'border-l-emerald-600',
    warning: 'border-l-amber-500',
    danger: 'border-l-red-600',
    info: 'border-l-sky-600',
    memory: 'border-l-violet-600',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
    memory: (
      <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-violet-600" />
      </div>
    ),
  };

  return (
    <ToastContext.Provider value={{ toast, success, warning, error, info, memory }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-3.5 bg-surface border border-border border-l-4 rounded-card shadow-lg transition-all duration-150',
              borderColors[t.type]
            )}
          >
            <div className="mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text">{t.title}</p>
              {t.message && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="text-text-muted hover:text-text p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
