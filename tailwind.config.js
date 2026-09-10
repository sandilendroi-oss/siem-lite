/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'siem-dark': '#0a0e1a',
        'siem-darker': '#060810',
        'siem-card': '#111827',
        'siem-border': '#1e293b',
        'siem-accent': '#3b82f6',
        'siem-surface': '#1a2332',
      },
    },
  },
  plugins: [],
};