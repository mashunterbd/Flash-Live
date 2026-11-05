/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0B0F17',
          surface: '#131B2E',
          surfaceHover: '#1E293B',
          surfaceElevated: '#1A2338',
          border: '#1E293B',
          borderFocus: '#3B82F6',
          text: '#F8FAFC',
          textMuted: '#94A3B8',
          primary: '#2563EB',
          primaryHover: '#1D4ED8',
          secondary: '#475569',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        full: '9999px'
      }
    },
  },
  plugins: [],
}

