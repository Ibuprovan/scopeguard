import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0B0D11',
          card: '#12151C',
          elevated: '#1A1E28',
        },
        border: {
          DEFAULT: '#2A2F3C',
          bright: '#3D4455',
        },
        brand: {
          DEFAULT: '#10B981',
          hover: '#34D399',
          dim: 'rgba(16, 185, 129, 0.15)',
        },
        text: {
          primary: '#F4F4F5',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        danger: {
          DEFAULT: '#F97316',
          dim: 'rgba(249, 115, 22, 0.15)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
