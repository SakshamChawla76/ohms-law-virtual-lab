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
          surface: '#f1f5f9',
          mat: '#e2e8f0',
          matborder: '#cbd5e1',
          grid: 'rgba(100, 116, 139, 0.12)',
        },
        chassis: {
          light: '#ffffff',
          panel: '#f8fafc',
          raised: '#ffffff',
          border: '#cbd5e1',
          rim: '#94a3b8',
          screws: '#94a3b8',
        },
        meter: {
          bezel: '#e2e8f0',
          face: '#fefefe',
          faceVintage: '#fbfbf9',
          mirror: 'linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 50%, #cbd5e1 100%)',
          needle: '#dc2626',
        },
        gauge: {
          amber: '#d97706',
          amberGlow: 'rgba(217, 119, 6, 0.2)',
          red: '#dc2626',
          green: '#059669',
          cyan: '#0284c7',
        },
        lead: {
          red: '#dc2626',
          black: '#334155',
          yellow: '#ca8a04',
          blue: '#2563eb',
          green: '#059669',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        meter: ['Chakra Petch', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'chassis-raised': '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'chassis-inset': 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.06)',
        'meter-dial': 'inset 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'needle-cast': '1px 3px 5px rgba(0, 0, 0, 0.25)',
        'knurl-depth': '0 2px 5px rgba(0,0,0,0.15), inset 0 1px 1px #ffffff',
        'led-amber': '0 0 8px rgba(217, 119, 6, 0.4)',
        'led-emerald': '0 0 8px rgba(5, 150, 105, 0.4)',
        'led-red': '0 0 8px rgba(220, 38, 38, 0.4)',
        'led-cyan': '0 0 8px rgba(2, 132, 199, 0.4)',
      },
    },
  },
  plugins: [],
}
