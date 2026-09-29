/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-muted': '#F1F5F9',
        border: '#E2E8F0',
        'border-strong': '#CBD5E1',
        text: '#0F172A',
        'text-muted': '#64748B',
        'text-faint': '#94A3B8',
        primary: {
          DEFAULT: '#4F46E5',
          soft: '#EEF2FF',
        },
        memory: {
          DEFAULT: '#7C3AED',
          soft: '#F5F3FF',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          soft: '#FFFBEB',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEF2F2',
        },
        info: {
          DEFAULT: '#0284C7',
          soft: '#F0F9FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
}
