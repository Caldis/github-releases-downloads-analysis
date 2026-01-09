import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        card: 'hsl(var(--card))',
        accent: 'hsl(var(--accent))',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', '"Menlo"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px hsl(var(--border)), 0 18px 60px -40px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease both',
        'fade-in': 'fade-in 0.7s ease both',
      },
    },
  },
  plugins: [],
} satisfies Config
