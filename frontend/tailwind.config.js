/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          surfaceHover: 'var(--surface-hover)',
          surfaceElevated: 'var(--surface-elevated)',
          surfaceCard: 'var(--surface-card)',
          border: 'var(--border)',
          borderSubtle: 'var(--border-subtle)',
          borderFocus: 'var(--border-focus)',
          text: 'var(--text)',
          textMuted: 'var(--text-muted)',
          accent: 'var(--accent)',
          accentStrong: 'var(--accent-strong)',
          accentGlow: 'var(--accent-glow)',
          success: 'var(--success)',
          danger: 'var(--danger)',
          warning: 'var(--warning)',
        },
        studio: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          surfaceHover: 'var(--surface-hover)',
          border: 'var(--border)',
          text: 'var(--text)',
          textMuted: 'var(--text-muted)',
          primary: 'var(--accent)',
          success: 'var(--success)',
          danger: 'var(--danger)',
          // Legacy fallbacks matching test suite
          legacyBg: '#0B0F17',
          legacySurface: '#131B2E'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px'
      }
    },
  },
  plugins: [],
}
