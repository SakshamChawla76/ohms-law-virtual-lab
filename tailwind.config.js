/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          950: '#070b14',
          900: '#0c1322',
          850: '#111b30',
          800: '#17233e',
          700: '#233458',
          border: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(17, 27, 48, 0.75)',
        },
        cyan: {
          neon: '#00f2fe',
        },
        amber: {
          neon: '#ffb300',
        },
        emerald: {
          neon: '#00f5a0',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.25)',
        'glow-amber': '0 0 25px rgba(255, 179, 0, 0.25)',
        'glow-emerald': '0 0 25px rgba(0, 245, 160, 0.25)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
