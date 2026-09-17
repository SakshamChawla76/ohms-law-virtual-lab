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
        bench: {
          surface: '#0d1117',
          mat: '#141824',
          matborder: '#1f2638',
          grid: 'rgba(255, 255, 255, 0.04)',
        },
        chassis: {
          dark: '#11141c',
          panel: '#171c28',
          raised: '#1f2536',
          border: '#2a3248',
          rim: '#36405a',
          screws: '#64748b',
        },
        meter: {
          bezel: '#181e2b',
          face: '#f8fafc',
          faceVintage: '#f3f4f6',
          mirror: 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
          needle: '#dc2626',
        },
        gauge: {
          amber: '#f59e0b',
          amberGlow: 'rgba(245, 158, 11, 0.35)',
          red: '#ef4444',
          green: '#10b981',
          cyan: '#0ea5e9',
        },
        lead: {
          red: '#ef4444',
          black: '#1e222b',
          yellow: '#eab308',
          blue: '#3b82f6',
          green: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        meter: ['Chakra Petch', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'chassis-raised': '0 8px 24px -4px rgba(0, 0, 0, 0.65), 0 2px 6px -1px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'chassis-inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(0, 0, 0, 0.8)',
        'meter-dial': 'inset 0 4px 12px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(255, 255, 255, 0.05)',
        'needle-cast': '2px 4px 6px rgba(0, 0, 0, 0.4)',
        'knurl-depth': '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
        'led-amber': '0 0 14px rgba(245, 158, 11, 0.6)',
        'led-emerald': '0 0 14px rgba(16, 185, 129, 0.6)',
        'led-red': '0 0 14px rgba(239, 68, 68, 0.7)',
        'led-cyan': '0 0 14px rgba(14, 165, 233, 0.6)',
      },
    },
  },
  plugins: [],
}
