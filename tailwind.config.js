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
        // Layered elevation system for dark mode
        background: '#09090b',
        surface: '#18181b',
        elevated: '#202023',
        card: '#18181b',
        border: '#27272a',
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          tertiary: '#52525b',
          muted: '#71717a',
        },
        // Brand accent - Electric Indigo
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d3ff',
          300: '#a5b5ff',
          400: '#818fff',
          500: '#6366f1',  // Main accent
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
        // Laboratory-specific colors
        lab: {
          bench: '#09090b',
          mat: '#18181b',
          matborder: '#27272a',
          grid: 'rgba(100, 116, 139, 0.25)',
          chassis: {
            light: '#ffffff',
            panel: '#fafafa',
            raised: '#ffffff',
            border: '#e4e4e7',
            rim: '#a1a1aa',
            screws: '#a1a1aa',
          },
          meter: {
            bezel: '#e4e4e7',
            face: '#ffffff',
            faceVintage: '#fafafa',
            mirror: 'linear-gradient(180deg, #e4e4e7 0%, #f4f4f5 50%, #e4e4e7 100%)',
            needle: 'rgb(220, 38, 38)',
          },
          gauge: {
            amber: 'rgb(217, 119, 6)',
            amberGlow: 'rgba(217, 119, 6, 0.3)',
            red: 'rgb(220, 38, 38)',
            green: 'rgb(5, 150, 105)',
            cyan: 'rgb(2, 132, 199)',
          },
          lead: {
            red: 'rgb(220, 38, 38)',
            black: 'rgb(51, 65, 85)',
            yellow: 'rgb(202, 138, 4)',
            blue: 'rgb(37, 99, 235)',
            green: 'rgb(5, 150, 105)',
          },
        },
        // Surface elevation tokens
        surfaceElevated: '#202023',
        surfaceCard: '#18181b',
        surfaceHover: '#27272a',
        surfaceActive: '#222226',
      },
      fontFamily: {
        display: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
        meter: ['JetBrains Mono', 'monospace'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Display scales with tracking
        'display-2xl': ['3rem', {
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          fontWeight: '600',
        }],
        'display-xl': ['2.5rem', {
          lineHeight: '1.05',
          letterSpacing: '-0.025em',
          fontWeight: '600',
        }],
        'display-lg': ['2rem', {
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'display-md': ['1.75rem', {
          lineHeight: '1.15',
          letterSpacing: '-0.015em',
          fontWeight: '600',
        }],
        'display-sm': ['1.5rem', {
          lineHeight: '1.15',
          letterSpacing: '-0.01em',
          fontWeight: '600',
        }],
        // Heading scales
        'heading-xl': ['1.25rem', {
          lineHeight: '1.2',
          letterSpacing: '-0.02em',
          fontWeight: '600',
        }],
        'heading-lg': ['1.125rem', {
          lineHeight: '1.25',
          letterSpacing: '-0.015em',
          fontWeight: '600',
        }],
        'heading-md': ['1rem', {
          lineHeight: '1.3',
          letterSpacing: '-0.01em',
          fontWeight: '500',
        }],
        // Body scales
        'body-lg': ['1rem', {
          lineHeight: '1.5',
          letterSpacing: '0em',
        }],
        'body-base': ['.875rem', {
          lineHeight: '1.5',
          letterSpacing: '0em',
        }],
        'body-sm': ['.75rem', {
          lineHeight: '1.5',
          letterSpacing: '0em',
        }],
        // Meta / Eyebrow
        'meta-base': ['.75rem', {
          lineHeight: '1.4',
          letterSpacing: '0.18em',
          fontWeight: '500',
          textTransform: 'uppercase',
        }],
      },
      spacing: {
        // 4px grid system
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',    // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem',     // 8px
        '2.5': '0.625rem', // 10px
        '3': '0.75rem',    // 12px
        '3.5': '0.875rem', // 14px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '8': '2rem',       // 32px
        '10': '2.5rem',    // 40px
        '12': '3rem',      // 48px
      },
      borderRadius: {
        // Modern radius system
        'xs': '0.125rem',      // 2px
        'sm': '0.375rem',      // 6px
        'md': '0.5rem',        // 8px
        'lg': '0.75rem',       // 12px
        'xl': '1rem',          // 16px
        '2xl': '1.5rem',       // 24px
        '3xl': '2rem',         // 32px
        'full': '9999px',
      },
      boxShadow: {
        // Refined elevation system
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Glassmorphism shadows
        'glass': '0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        // Component shadows
        'chassis': '0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)',
        'meter': 'inset 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'needle': '1px 3px 5px rgba(0, 0, 0, 0.25)',
        'knurl': '0 2px 5px rgba(0,0,0,0.15), inset 0 1px 1px #ffffff',
      },
      animation: {
        // Animation timing definitions
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        // Transition curves for spring physics
        'spring-snappy': 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-fluid': 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-bounce': 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        // Stagger animations
        'stagger-50': '0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'stagger-100': '1s cubic-bezier(0.16, 1, 0.3, 1)',
        'stagger-150': '1.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'stagger-200': '2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionProperty: {
        'transform': 'transform',
        'opacity': 'opacity',
        'colors': 'background-color, border-color, color, fill, stroke',
        'shadow': 'box-shadow',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'spring-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-fluid': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-bounce': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'drawer': '1040',
        'modal': '1050',
        'popover': '1060',
        'toast': '1070',
        'overlay': '1080',
        'progress': '1090',
      },
    },
  },
  // Custom plugin configuration
  plugins: [
    // Custom utilities plugin would go here
    // We'll need custom CSS for additional design tokens
  ],
}
