/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#07090b', 800: '#0a0d10', 700: '#101418', 600: '#171c22', 500: '#212832' },
        line: { DEFAULT: '#1e242c', bright: '#2c3644' },
        fg: { DEFAULT: '#e8ecf1', dim: '#93a0b0', mute: '#5c6674' },
        accent: '#2dd4c8',
        support: '#3fb98a',
        partial: '#e0a33c',
        missing: '#e2603f',
        critical: '#d6425b',
        conflict: '#b78af0',
        info: '#4d8dff',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
    },
  },
  plugins: [],
};
