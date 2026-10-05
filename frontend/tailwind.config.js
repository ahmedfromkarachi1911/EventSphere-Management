/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    container: false, // we define our own .container in index.css
  },
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        bg: 'var(--bg)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
        neutral: 'var(--neutral-bg)',
        sidebar: 'var(--sidebar-bg)',
        'sidebar-active': 'var(--sidebar-bg-active)',
        'sidebar-text': 'var(--sidebar-text)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '18px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
        DEFAULT: '0 4px 16px rgba(15, 23, 42, 0.06)',
        lg: '0 12px 32px rgba(15, 23, 42, 0.10)',
      },
      ringColor: {
        primary: 'var(--primary-ring)',
      },
    },
  },
  plugins: [],
}
